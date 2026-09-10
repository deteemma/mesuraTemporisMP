This project has no dedicated "run" skill or docker-compose, so here's the direct answer from the code itself (backend/package.json, frontend/package.json, [server.js](backend/src/server.js), [dev-server.js](backend/dev-server.js)):

# Start

- Backend: `cd backend; npm run dev` — runs [dev-server.js](backend/dev-server.js), which boots its own in-memory single-node MongoDB replica set (via `mongodb-memory-server`), bootstraps an `admin`/`admin` user, and listens on port 3000. No external Mongo needed, and the data resets every run.
  - **Do not use `npm start` for local dev.** It runs [server.js](backend/src/server.js), which connects to an external Mongo at `mongodb://127.0.0.1:27017/mesuretemporismp` (or `MONGO_URI`) as a **standalone** instance — several routes (`/chrono/start`, Scission) use multi-document transactions, which MongoDB only supports on a replica set or mongos, so a standalone Mongo throws `Transaction numbers are only allowed on a replica set member or mongos`. `npm start` is meant for an environment where Mongo is already deployed as a replica set (production-shaped setup, not covered by this repo).
- Frontend: `cd frontend; npm start` — runs `ng serve`, serves on `http://localhost:4200` by default, proxying/calling the backend API.

# Stop

- Both are foreground processes in this setup (no daemon/PM2/docker-compose config in the repo) — just `Ctrl+C` in each terminal.

`npm run dev`'s in-memory database means no `.env` or local `mongod` install is required for day-to-day backend development.