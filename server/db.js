const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./dashboard.db", (err) => {
    if (err) {
        console.error("Error opening database:", err);
    } else {
        console.log("SQLite database connected");

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                leetcode TEXT,
                codeforces TEXT,
                atcoder TEXT,
                github TEXT
            )
        `);
    }
});

module.exports = db;
