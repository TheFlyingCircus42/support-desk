# Support Desk

A ticketing app built by following an instructor's course (screen recordings,
not a spec doc) — now in week three of three. Node/Express API (`server/`)
backed by Postgres, React/Vite frontend (`web/`).

**Match the instructor's pace and structure — don't build ahead of the
course, even when a more-complete design seems obvious.** Check whether a
feature has actually been covered before adding it.

## Stack

- **Web**: React + Vite (`web/`) — dev server on :5173, proxies `/api` to :4000
- **API**: Node + Express, ES modules (`server/`) — port 4000 (override with `PORT`)
- **Data**: Postgres via `node-pg-migrate` (`server/migrations/`)
- **Auth**: JWT bearer tokens, `requireAuth` middleware gates `/api/tickets/*`

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
curl http://localhost:4000/api/tickets   # 401 without a bearer token
```

## Current layout (server/)

```
server/
├── migrations/          node-pg-migrate files
└── src/
    ├── index.js / app.js   entry point + Express app assembly
    ├── config/index.js     env access; throws at boot if JWT_SECRET unset
    ├── constants/index.js  TICKET_STATUSES/PRIORITIES, ERROR_CODES, DEMO_PASSWORD, AUTH_FAILURE_MESSAGE
    ├── db.js                Postgres connection pool
    ├── auth/                passwords.js (bcrypt), tokens.js (JWT sign/verify)
    ├── routes/               EXACTLY 4 FILES: index.js, health.js, auth.js, tickets.js
    ├── services/             authService.js (register/login/getCurrentUser), ticketService.js
    ├── repositories/         ticketRepository.js, userRepository.js
    ├── errors/AppError.js    notFound/validation/unauthenticated/conflict helpers
    └── middleware/           errorHandler.js (centralized), requireAuth.js
```

`web/src/`: `main.jsx`, `App.jsx`, `pages/Home.jsx`,
`components/{header,TicketDetail}.jsx`, `lib/api.js`.

## Code Conventions

- Every API route returns JSON.
- Errors are returned via the centralized `errorHandler` middleware.
- Client code calls relative `/api/...` paths (never a hard-coded host), so
  the Vite dev proxy and any future deployment both work unchanged.
- The client fetch helper (`web/src/lib/api.js`) throws on a non-ok response.
- One file per route group (`routes/{health,auth,tickets}.js`), not
  one-file-per-endpoint — matches the instructor's structure.

## Environment Variables

`server/.env` needs `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `JWT_SECRET`
(required — server won't boot without it), `ACCESS_TOKEN_TTL`,
`BCRYPT_ROUNDS`. See `server/.env.example`.

## Do Not

- Don't build features the course hasn't covered yet, even if the shape is
  obvious (e.g. `login()` exists in `authService.js` but stays unwired to a
  route until that lesson).
- No unapproved dependencies — stick to what's already installed unless
  discussed first.
- No committing `node_modules` or secrets (`.env`, API keys, etc.).
