devMetrics — Personal Coding Analytics Platform
devMetrics is a full-stack web app I built to solve a problem I personally had — constantly switching between Codeforces and GitHub just to check my own progress. Instead of juggling multiple tabs, devMetrics pulls everything into one clean dashboard with real data and interactive charts.

What it does

Connect your Codeforces and GitHub accounts
See problems solved, submission verdicts, and rating trends from Codeforces
View your commit history and activity patterns from GitHub
All data is fetched live from public APIs — no manual input needed
Each user gets their own personalized dashboard


Tech Stack
LayerTechnologyFrontendHTML, CSS, JavaScript, Chart.jsBackendNode.js, Express.jsDatabaseSQLiteAPIsCodeforces Public API, GitHub REST API

Running it locally
bash# Clone the repo
git clone https://github.com/yourusername/devmetrics

# Install dependencies
cd server
npm install

# Start the server
node index.js

# Open the frontend
# Just open client/form.html in your browser

What I learned building this
This was my first time integrating multiple third-party APIs into a single project. Handling async data fetching, dealing with GitHub's rate limits, and figuring out how to structure a full-stack app from scratch taught me more than any tutorial did.
Planned improvements include password-based authentication, LeetCode integration, and a deployed live version.

Screenshots
(add screenshots here)
