const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Use /data directory on Railway, local folder otherwise
const dbDir = process.env.RAILWAY_ENVIRONMENT ? "/data" : __dirname;
const dbPath = path.join(dbDir, "dashboard.db");

// Create /data directory if it doesn't exist
if (process.env.RAILWAY_ENVIRONMENT && !fs.existsSync("/data")) {
    fs.mkdirSync("/data", { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err);
    } else {
        console.log("SQLite connected at:", dbPath);

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
