class WS {
    constructor() {
        this.clientList = {};
        this.monster = {};
        this.saveClient = this.saveClient.bind(this);
        this.retClientList = this.retClientList.bind(this);
        this.saveClientScore = this.saveClientScore.bind(this);
        this.retClientScore = this.retClientScore.bind(this);
        this.kickAll = this.kickAll.bind(this);
        this.initMonster = this.initMonster.bind(this);
        this.retMonsterHP = this.retMonsterHP.bind(this);
        this.isMonsterDead = this.isMonsterDead.bind(this);
        this.killMonster = this.killMonster.bind(this)
    }

    saveClient(username, client, role = "student") {
        this.clientList[username] = client;
        this.clientList[username]["totalscore"] = 0;
        this.clientList[username]["role"] = role;
    }

    saveClientScore(name, score) {
        this.clientList[name]["totalscore"] += score;
        console.log("Client :", name, " Score :", this.retClientScore(name))
    }

    retClientList() {
        return Object.keys(this.clientList)
    }

    retClientScore(player) {
        return this.clientList[player]["totalscore"];
    }

    kickAll() {
        console.log("Kicking all clients")
        const playerlist = Object.keys(this.clientList)
        const playerlist_len = playerlist.length
        for (let i = 0; i < playerlist_len; i++) {
            this.clientList[playerlist[i]].terminate()
        }
    }

    initMonster(hp) {
        this.monster.hp = hp;
        this.monster.isdead = false;
    }

    retMonsterHP() {
        return this.monster.hp
    }

    killMonster() {
        this.monster.isdead = true;
    }

    isMonsterDead() {
        return this.monster.isdead
    }
}

module.exports.WS = WS;