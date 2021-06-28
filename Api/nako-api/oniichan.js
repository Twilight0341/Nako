class Oniichan {
    constructor() {
        this.oniichan = {}
        this.daisuke = this.daisuke.bind(this)
        this.ecchi = this.ecchi.bind(this)
        this.baka = this.baka.bind(this)
        this.yamero = this.yamero.bind(this)
    }

    daisuke = () => {
        console.log("onni chan daisuke desu UwU")
    }

    ecchi = () => {
        console.log("onni chan ecchi OwO")
    }

    baka = () => {
        console.log("onni chan daisuke baka")
    }

    yamero = () => {
        console.log("yamero onni chan >_<")
    }
}


module.exports.Oniichan = Oniichan;