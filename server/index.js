const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= TEST ROUTES ================= */

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.get("/test", (req, res) => {
    res.send("Test route working!");
});

/* ================= SIGN UP ================= */

app.post("/saveLinks", (req, res) => {
    const { name, email, leetcode, codeforces, atcoder, github } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const query = `
        INSERT INTO users (name, email, leetcode, codeforces, atcoder, github)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
        query,
        [name, normalizedEmail, leetcode, codeforces, atcoder, github],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(409).json({
                        error: "Email already exists. Please sign in."
                    });
                }
                return res.status(500).json({ error: "Database error" });
            }

            res.status(201).json({
                success: true,
                message: "Account created successfully",
                userId: this.lastID
            });
        }
    );
});

/* ================= LOGIN ================= */

app.post("/login", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [normalizedEmail],
        (err, user) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (!user) return res.status(404).json({ error: "User not found" });

            res.json({ success: true, user });
        }
    );
});

/* ================= GET LOGGED-IN USER ================= */

app.get("/getUser/:email", (req, res) => {
    const email = req.params.email.trim().toLowerCase();

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, user) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (!user) return res.status(404).json({ error: "User not found" });

            res.json(user);
        }
    );
});

/* =====================================================
   CODEFORCES REAL API (STEP 1)
   ===================================================== */
app.get("/api/codeforces/user/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();

        // 1️⃣ Get user from DB
        db.get(
            "SELECT codeforces FROM users WHERE email = ?",
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: "DB error" });
                }

                if (!user || !user.codeforces) {
                    return res.status(404).json({
                        error: "Codeforces handle not found for this user"
                    });
                }

                // 2️⃣ Fetch from Codeforces
                const response = await fetch(
                    `https://codeforces.com/api/user.info?handles=${user.codeforces}`
                );

                const data = await response.json();

                if (data.status !== "OK") {
                    return res.status(404).json({
                        error: "Codeforces user not found"
                    });
                }

                // 3️⃣ Send real data
                res.json(data.result[0]);
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Codeforces API failed" });
    }
});


/**
 * SUBMISSIONS DATA
 * Used for graphs (month-wise problems)
 */
app.get("/api/codeforces/submissions/user/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();

        // 1️⃣ Get Codeforces handle from DB
        db.get(
            "SELECT codeforces FROM users WHERE email = ?",
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: "DB error" });
                }

                if (!user || !user.codeforces) {
                    return res.status(404).json({
                        error: "Codeforces handle not found for this user"
                    });
                }

                const handle = user.codeforces;

                // 2️⃣ Fetch submissions from Codeforces
                const response = await fetch(
                    `https://codeforces.com/api/user.status?handle=${handle}`
                );

                const data = await response.json();

                if (data.status !== "OK") {
                    return res.status(404).json({
                        error: "Submissions not found"
                    });
                }

                // 3️⃣ Send submissions
                res.json(data.result);
            }
        );
    } catch (err) {
        res.status(500).json({ error: "Codeforces API failed" });
    }
});

/* ================= GITHUB REAL API ================= */

app.get("/api/github/commits/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();

        db.get(
            "SELECT github FROM users WHERE email = ?",
            [email],
            async (err, user) => {
                if (err) return res.status(500).json({ error: "DB error" });
                if (!user || !user.github) {
                    return res.status(404).json({ error: "GitHub not linked" });
                }
                // 1️⃣ Extract username
                const username = user.github.split("/").pop();

                // 2️⃣ Fetch repos
                const repoRes = await fetch(
                    `https://api.github.com/users/${username}/repos`
                );
                const repos = await repoRes.json();

                const monthlyCommits = {};

                // 3️⃣ Limit repos (avoid rate-limit)
                for (let i = 0; i < Math.min(repos.length, 5); i++) {
                    const repo = repos[i];

                    const commitRes = await fetch(
                        `https://api.github.com/repos/${username}/${repo.name}/commits`
                    );
                    const commits = await commitRes.json();

                    if (!Array.isArray(commits)) continue;

                    commits.forEach(c => {
                        if (!c.commit || !c.commit.author) return;

                        const date = new Date(c.commit.author.date);
                        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

                        monthlyCommits[key] = (monthlyCommits[key] || 0) + 1;
                    });
                }

                res.json(monthlyCommits);
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "GitHub API failed" });
    }
});



/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
