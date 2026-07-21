# Support Desk

A small ticketing app built incrementally as a learning project. The backend
is an Express API that serves ticket data; the frontend is a React/Vite app
that fetches and displays those tickets. It's currently a week-one scaffold —
no persistence layer yet.

## Stack

- **Web**: React + Vite (`web/`) — dev server on :5173, proxies `/api` to :4000
- **API**: Node + Express, ES modules (`server/`) — port 4000 (override with `PORT`)
- **Data**: in-memory array (`server/src/data/tickets.js`) — no database in week one

## Commands

Server (`server/`):
```
npm start      # node src/index.js
npm run dev    # node --watch src/index.js
```

Web (`web/`):
```
npm run dev       # vite dev server
npm run build     # vite build
npm run preview   # vite preview
```

Smoke test (with the server running):
```
curl http://localhost:4000/api/health
curl http://localhost:4000/api/tickets
```

## Code Conventions

- Every API route returns JSON.
- Errors are returned as `{ "error": "" }` with the correct HTTP status code.
- Client code calls relative `/api/...` paths (never a hard-coded host), so
  the Vite dev proxy and any future deployment both work unchanged.
- The client fetch helper (`web/src/api.js`) throws on a non-ok response.

## Directory Norms

- Routes: `server/src/routes/`
- Data: `server/src/data/`
- Client code: `web/src/` (API helper in `web/src/api.js`, components alongside it)

## Do Not

- No database — in-memory data only for now.
- No auth.
- No unapproved dependencies — stick to what's already installed
  (express, cors, react, vite) unless discussed first.
- No committing `node_modules` or secrets (`.env`, API keys, etc.).

## Git Usage

- New features are developed on a new branch, named
  `yyyy-mm-dd-hh-short-name` (date/hour prefix + a short, suitable name).
- Merge a branch back to `main` only once it's complete and tested.
- Never merge broken code — flag it if an attempt is made to merge something
  broken or untested.
- Make regular commits with short, clear messages.
