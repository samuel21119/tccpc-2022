const fs = require("fs");
const axios = require("axios");
const cheerio = require('cheerio');


//-- Parameters
const DOMJUDGE_URL = "https://nthucp.cs.nthu.edu.tw";
const AUTH = "Basic " + "YWRtaW46c2Q3OHVOMDBDR0p3YXRYNA==";
const ADMIN = "admin";
const PASS = "";
const PHPSESSID = "kdki5h6gfhh091r4hdo8lbhs3u";
const CONTEST_ID = "7";
const FROZEN_TIME = "200000";
//-- Parameters

const API_DOCS = `${DOMJUDGE_URL}/api/doc`;
const API_PROBLEM_LIST = `${DOMJUDGE_URL}/api/v4/contests/${CONTEST_ID}/problems?strict=false`;
const API_TEAM_LIST = `${DOMJUDGE_URL}/api/v4/contests/${CONTEST_ID}/teams?strict=false`;
const API_SUBMISSION_LIST = `${DOMJUDGE_URL}/api/v4/contests/${CONTEST_ID}/submissions?strict=false`;
const WEB_SUBMISSION_LIST = `${DOMJUDGE_URL}/jury/submissions`

let contest = {};
let problemId_to_index = {}

contest["frozen_second"] = FROZEN_TIME;

const writeJSON = () => {
    fs.writeFile("contest.json", JSON.stringify(contest, null, 2), (err) => {
        if (err)
            console.log(err);
    });
}

const getProblems = () => {
    return new Promise(async(res, rej) => {
        let config = {
            method: 'get',
            url: API_PROBLEM_LIST,
            headers: {
                accept: "application/json",
                Authorization: AUTH
            }
        };
        const req = await axios(config);
        const data = req["data"];
        console.log(`Problem count: ${data.length}`);
        data.forEach((ele, idx) => {
            const {id} = ele;
            problemId_to_index[id] = idx + 1;
        })
        contest["problem_count"] = data.length;
        res();
    });
}

const getTeams = () => {
    return new Promise(async(res, rej) => {
        let config = {
            method: 'get',
            url: API_TEAM_LIST,
            headers: {
                accept: "application/json",
                Authorization: AUTH
            }
        };
        const req = await axios(config);
        const data = req["data"];
        let teams = {};
        data.forEach(ele => {
            const teamId = ele["id"];
            const affiliation = ele["affiliation"];
            const name = ele["name"];
            teams[teamId] = {
                name: name,
                college: affiliation,
                is_exclude: false
            };
        });
        contest["users"] = teams;
        console.log(contest);
        res();
    });
}

const getSubmissions = () => {
    return new Promise(async(res, rej) => {
        let config = {
            method: 'get',
            url: API_SUBMISSION_LIST,
            headers: {
                accept: "application/json",
                Authorization: AUTH
            }
        };
        let req = await axios(config);
        const data = req["data"];
        let submissions = {};
        data.forEach(ele => {
            const {contest_time, team_id, problem_id, id} = ele;
            let time = contest_time.split(":");
            let seconds = parseInt(time[2]) + 60 * (parseInt(time[1]) + 60 * parseInt(time[0]));
            submissions[id] = {
                user_id: team_id,
                problem_index: problemId_to_index[problem_id],
                submitted_seconds: seconds
            }
        })

        config = {
            method: 'get',
            url: WEB_SUBMISSION_LIST,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:97.0) Gecko/20100101 Firefox/97.0",
                "Content-Type": "application/json",
                "Cookie": `PHPSESSID=${PHPSESSID};domjudge_cid=${CONTEST_ID}`
            }
        };
        req = await axios(config);
        const $ = cheerio.load(req.data);
        $("table.submissions-table").find("tbody > tr").each((idx, ele) => {
            const sid = $(ele).attr("data-submission-id");
            let verdict = $(ele).attr("data-result");
            if (verdict == "correct")
                verdict = "AC";
            else if (verdict == "compiler-error")
                verdict = "CE";
            else if (verdict == "wrong-answer")
                verdict = "WA";
            else if (verdict == "timelimit")
                verdict = "TLE";
            else
                verdict = "RE";
            submissions[sid]["verdict"] = verdict;
        });
        contest["solutions"] = submissions;
        writeJSON();
        res();
    })
}

(async() => {

    await getProblems();
    await getTeams();
    await getSubmissions();
})();

