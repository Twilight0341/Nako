const WebSocket = require('ws')
const ws = require('./ws')
const fs = require('fs');
var sleep = require('sleep');

let GameInfo = {}


read_file = () => {
    let obj = JSON.parse(fs.readFileSync('./qbank.json', 'utf8'));
    GameInfo = obj
}

read_file()

const clients = new ws.WS();
const socket = new WebSocket.Server({port: 1880});

let lobbyid = 123
let players = {}

let is_started = false
let is_countdown = false
let is_prep = false
let timer = 0
let prep_t = 0
let q = 0
let qno = 0


qno = GameInfo.questions.length

socket.on('connection', (client, req) => {
    client.id = ""

    const welcome_msg = {
        "msg": "hello"
    }
    console.warn("a WS client connected")
    client.send(JSON.stringify(welcome_msg));

    client.on('message', (msg) => {
        console.log("msg from client :\n", msg)
        handle_msg(client, msg)
    })

    client.on('close', function close() {
        console.warn("a WS client disconnected")
        let key = client.id
        // console.log(client.id)
        if (key) {
            console.log("kicked player :", key, "from Lobby")
            delete clients.clientList[key]
            refresh_players()
            handle_valid({}, {
                "type": "lobby_update"
            }, "res", "yes")
        }
    });
})

handle_correct = (c, answer, q) => {
    if (answer == GameInfo.questions[q].corr) {
        console.log("ans", answer)
        handle_score(c, 1)
        console.log("Correct Answer")
    } else {
        console.log("Incorrect answer")
    }
}

handle_score = (c, score) => {
    console.log("saving client score")
    let key = Object.keys(clients.clientList).find(key => clients.clientList[key] === c)
    clients.saveClientScore(key, score)
}

handle_msg = (c, msg) => {
    try {
        let obj = JSON.parse(msg)
        if (obj.method && obj.type) {
            console.log("Valid msg ")
            if (obj.method === "req") {
                handle_valid(c, obj, "req")
            } else {
                handle_res(c, obj)
            }
        } else {
            console.log("malformed msg : \n", obj);
        }
    } catch (e) {
        if (!e) {
            console.warn("unspecified error", "see above for details")
        } else {
            console.warn("error :", e)
        }
    }
}

handle_retscore_all = () => {
    let result = []
    let i = 0
    players.forEach(ele => {
            let p = players[i]
            let obj = clients.clientList[p]
            if (p != "Debug" && p != "DebugTeacher") {
                let r = {
                    "name": p,
                    "score": handle_retscore(obj)
                }
                result.push(r)
            }
            i++
        }
    )
    // console.log(result)
    return result
}

handle_retscore = (c) => {
    let key = Object.keys(clients.clientList).find(key => clients.clientList[key] === c)
    return clients.retClientScore(key)
}

handle_valid = (c, msg, method, all = "no") => {
    if (method == "req") {
        if (msg.type == "lobby_join" && !is_started && !is_prep) {
            if (msg.payload.accountInfo.name) {
                lobbyid = msg.payload.lobbyID
                if (msg.payload.accountInfo.role == "teacher") {
                    clients.saveClient(msg.payload.accountInfo.name, c, "teacher")
                } else {
                    clients.saveClient(msg.payload.accountInfo.name, c)
                }
                c.id = msg.payload.accountInfo.name
                clients.clientList[c.id].is_res = {
                    "q": 0,
                    "state": false
                }
                handle_valid(c, msg, "res")
                handle_valid(c, {
                    "type": "lobby_update"
                }, "res", "yes")
            }
        } else if (msg.type == "game_start" && !is_started && !is_prep) {
            handle_valid(c, msg, "res", "yes")
            handle_valid(c, {
                "method": "res",
                "type": "game_start_res",
                "payload": null
            }, "res")
        } else if (msg.type == "answer_question") {
            handle_correct(c, msg.payload.choice, msg.payload.currentQuestionCheck)
        } else if (msg.type == "lobby_create") {
            read_file()
            handle_valid(c, msg, "res")
        } else {
            throw console.error("invalid type", msg.type)
        }
    } else if (method == "res") {
        let obj = {
            "method": "res",
            "type": msg.type,
            "payload": null
        }
        if (msg.type == "lobby_join") {
            let p = players
            if (Object.keys(p).length > 0) {
                p = p.filter(item => item !== "Debug").filter(item => item !== "DebugTeacher")
            }
            refresh_players()
            obj.payload = {
                "lobbyInfo": {
                    "id": lobbyid,
                    "players": p
                },
                "error": null
            }
            handle_retscore_all()
        } else if (msg.type == "game_start") {
            obj.method = "req"
            obj.payload = {
                "gameInfo": GameInfo
            }
            read_file()
            is_prep = true
            is_countdown = true
        } else if (msg.type == "game_start_res") {
            obj.type = "game_start"
            obj.method = "res"
            obj.payload = null
        } else if (msg.type == "lobby_update") {
            let p = players
            if (p) {
                p = p.filter(item => item !== "Debug").filter(item => item !== "DebugTeacher")
            }
            // console.log(p)
            obj.payload = {
                "lobbyInfo": {
                    "id": lobbyid,
                    "players": p
                }
            }
        } else if (msg.type == "game_update") {
            obj.method = "req"
            obj.type = msg.type
            obj.payload = {
                "currentQuestion": q
            }
        } else if (msg.type == "game_end") {
            let pl = handle_retscore_all()
            obj.method = "req"
            obj.type = msg.type
            obj.payload = pl
        } else if (msg.type == "question_start") {
            obj.method = "req"
            obj.type = msg.type
            obj.payload = null
        } else if (msg.type == "question_end") {
            obj.method = "req"
            obj.type = msg.type
            obj.payload = {
                "correctAnswer": GameInfo.questions[q - 1].corr,
                "stats": {
                    "correct": 1,
                    "incorrect": 0,
                    "noAnswer": 0
                }
            }
        } else if (msg.type == "lobby_create") {
            obj.method = "res"
            obj.type = msg.type
            obj.payload = {
                "lobbyID": 420
            }
        }
        if (all == "yes") {
            console.log("to all with msg:", obj)
            for (let i = 0; i < players.length; i++) {
                let p = players[i]
                // console.log(p)
                // console.log(clients.clientList[p])
                c = clients.clientList[p]
                c.send(JSON.stringify(obj))
            }
        } else {
            console.log("responded with msg:", obj)
            c.send(JSON.stringify(obj))
        }
    } else {
        throw console.error("invalid method:", method);
    }
}

handle_res = (c, obj) => {
    if (obj.type === "question_start") {
        let key = Object.keys(clients.clientList).find(key => clients.clientList[key] === c)
        clients.clientList[key].is_res.state = true
    } else {
        console.log("invalid res")
    }
}


refresh_players = () => {
    players = clients.retClientList()
    // console.log(players)
}

checkres = () => {
    let i = 0
    if (is_started) {
        if (players.length >= 1) {
            players.forEach((ele, i) => {
                let obj = clients.clientList[players[i]]
                let state = obj.is_res.state
                if (!state) {
                    handle_valid(obj, {"type": "question_start"}, "res")
                }
            })
        }
    }
}

clearstate = () => {
    if (players.length >= 1) {
        players.forEach((ele, i) => {
            clients.clientList[players[i]].is_res.state = false
        })
    }
}

const interval = setInterval(function () {
    checkres()
    // console.log(Object.keys(clients.clientList).length)
    // refresh_players()
    if (is_prep) {
        if (prep_t < 1) {
            console.log("------------------------")
            console.log("Game starting in 5")
        }
        prep_t++
        if (prep_t > 5) {
            is_started = true
            prep_t = 0
            is_prep = false
        }
    }
    if (is_started) {
        if (is_countdown) {
            if (timer == 0 && q == 0) {
                console.log("--------------------------------------")
                console.log("init Monster")
                console.log("--------------------------------------")
                console.log("count down started")
                console.log("total q: ", qno)
                handle_valid({}, {
                        "type": "game_update"
                    }, "res", "yes"
                )
                sleep.sleep(4)
                clearstate()
                handle_valid({}, {"type": "question_start"}, "res", "yes")
                q++
                sleep.sleep(2)
                console.log("round ended")
                console.log("Current Question :", q)
                console.log("--------------------------")

            }
            if (q >= 1 && q < qno + 1) {
                let t = GameInfo.questions[q - 1].timeLimit
                if (timer == t) {
                    handle_valid({}, {"type": "question_end"}, "res", "yes")
                    console.log("round ended")
                    console.log("Current Question :", q + 1)
                    sleep.sleep(3)
                    console.log("--------------------------")
                    if (q < qno) {
                        handle_valid({}, {
                                "type": "game_update"
                            }, "res", "yes"
                        )
                        sleep.sleep(5)
                        clearstate()
                        handle_valid({}, {"type": "question_start"}, "res", "yes")
                        sleep.sleep(2)
                    }
                    q++
                    timer = -1
                }
            } else {
                is_started = false
                console.log("game ended")
                is_countdown = false
                timer = 0
                console.log("--------------------------------------")
                handle_valid({}, {
                    "type": "game_end"
                }, "res", "yes")
                clients.kickAll()
            }
            timer++
            if (timer >= 1) {
                // console.log(timer)
            }
        }
    } else {
        q = 0
        timer = 0
    }
    // console.log(Object.keys(clients.clientList))
}, 1000);