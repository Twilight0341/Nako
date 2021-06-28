const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./nako.db');

sql = (q) => {
    try {
        let result = db.run(q);
        return result
        db.close();
    } catch (err) {
        console.log("query error: " + err)
    }
}