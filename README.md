ioi-resover
==================
Forked from [lixin-wei/acm-resolver](https://github.com/lixin-wei/acm-resolver)，modify code to support IOI contests mode(partial points supports).  


# 截图

![screenshot](screenshots/shot1.gif)

User Guide
------------------------

## 1. Prepare data
Import data's code is located in `js/main.js`: `$.getJSON("contest.json", function(data){..})`  

The default contest data file is `contest.json`, which is in root folder. You can paste your own data into it.  
[samuel21119/cf-contest-crawler](https://github.com/samuel21119/cf-contest-crawler) can auto export codeforces' contest.json.

## 2. Host Server

1. Page must be visited by http protocol. Prepare a web server, recommend WAMP for Windows, MAMP for macOS or run `python -m SimpleHTTPServer` for testing.  
2. Copy all files to the directory under the server and visit `index.html` in the browser.

## 3. Control Explanation

- Press RIGHT arrow key to continue.  
- Press ENTER to focus on current rank.

## JSON format

```
{
  frozen_second: 3600,
  problem_count: 10,
  solutions: {... },
  users: {... }
}
```

### Solution

- Key value of the submission can be any
- Problem index is counted from 1

```
381503: {
  user_id: "ABC",
  problem_index: "1",
  verdict: "AC",
  submitted_seconds: 22
},
381504: {
  user_id: "2",
  problem_index: "1",
  verdict: "P10",
  submitted_seconds: 23
},
```
P0 = Wrong Answer: 0  
P10 = Partial score: 10  
AC = Accept: 100  

### Users

- Key value is the user ID, must match with the submission  

```
ABC: {
  name: "花落人亡两不知",
  college: "HZNU",
  is_exclude: true
},
2: {
  name: "大斌丶凸(♯｀∧´)凸",
  college: "HDU",
  is_exclude: false
},
3: {
  name: "天才少女队",
  college: "PKU",
  is_exclude: true
},
```

