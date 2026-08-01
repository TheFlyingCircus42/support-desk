## SUPPORT DESK APP

This project is a full-stack support desk web app - using react/vite on the front end with node Express server on the back end. Backed by PostgreSQL - tickets and users are stored and queried from a real database, with migrations and a seed script included.

Currently users can view a list of sample tickets.
Working towardsa a full suite of fetures including post new tickets, delete tickets, close tickets, change ticket status add notes to tickets, user base and ticket editing permissions.

## FEATURES
-Current features 
    - View Tickets
    - User registration + JWT auth (all ticket routes require a logged-in user - see [Auth](#auth))

-Planned features:
    - delete tickets
    - close tickets
    - post new tickets
    - change ticket status
    - login (register works; login route not wired up yet)
    - ticket editing permissions


## TECH STACK
- Node js
- Express
- Rect / Vite
- PostgreSQL

## GETTING SET UP

- Fork and clone the repo to your local machine.

### Database setup

The API requires a Postgres database - it will not start without one.

1. Create a local Postgres database (e.g. `createdb supportdesk`).
2. Copy `server/.env.example` to `server/.env` and fill in `DATABASE_URL` (see [Environment Variables](#environment-variables)).
3. From `server/`, run migrations and seed some sample data:
   ```bash
   cd server
   npm run migrate:up
   npm run seed
   ```

### Quick start (recommended)

A root-level `package.json` wires both halves of the app together with
[`concurrently`](https://www.npmjs.com/package/concurrently). From the
project root:

```bash
npm run install:all
npm run dev
```

`install:all` installs dependencies in both `server/` and `web/`. `dev` then
runs the API and the web app together, with output labelled `[server]` /
`[web]`:

- API: http://localhost:4000
- Web: http://localhost:5173

### Manual / run each half individually

If you'd rather set up or run `server/` and `web/` on their own (useful for
running just one side, or debugging one in isolation):

```bash
cd server
npm install
npm start
```
terminal should print: "Support-desk API listening on http://localhost:4000"

```bash
cd web
npm install
npm run dev
```
VITE should print in terminal:
```
VITE v8.1.5  ready in 237 ms
➜  Local:   http://localhost:5173/
```

See [Commands](#commands) below for the full list of scripts available in
each directory.

## Check Status in browser or via curl cmd
- http://localhost:4000/api/health should return a JSON object: {"status":"ok"} (liveness only - never touches the database)
- http://localhost:4000/api/ready should return a JSON object: {"status":"ready","tickets":<count>} - or a 503 with {"status":"unavailable","error":"database unreachable"} if the database can't be reached
- http://localhost:4000/api/tickets/count should return a JSON object: {"count": 2} (count of tickets with status "open") - requires `Authorization: Bearer <token>`, see [Auth](#auth)
- http://localhost:4000/api/tickets/open should return the same as /api/tickets/count (open ticket count) - also requires a token

- http://localhost:5173/ should return a live site. Landing page is curently a ticket list view. 

## COMMANDS

### Root (from the project root)

| Command | Description |
| --- | --- |
| `npm run install:all` | Install dependencies in both `server/` and `web/` |
| `npm run dev` | Run the API and web app together (labelled `[server]` / `[web]`) |
| `npm run dev:web` | Run only the web dev server |
| `npm run build` | Build the web app for production (`web/dist`) |
| `npm start` | Start the API server (production mode, no file watching) |

### `server/` (run from inside `server/`)

| Command | Description |
| --- | --- |
| `npm start` | Start the API server (`node src/index.js`) |
| `npm run dev` | Start the API server with file watching (`node --watch src/index.js`) |
| `npm run migrate:up` | Apply pending Postgres migrations (`server/migrations/`) |
| `npm run migrate:down` | Roll back the last Postgres migration |
| `npm run seed` | Seed sample users/tickets into Postgres (`src/scripts/seed.js`) |

### `web/` (run from inside `web/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the web app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the web app with oxlint |

## ENVIRONMENT VARIABLES
Copy `server/.env.example` to `server/.env` and fill in the values (never commit `.env`):
    - `DATABASE_URL` - Postgres connection string, e.g. `postgres://supportdesk:supportdesk@localhost:5432/supportdesk`
    - `PORT` - API port (defaults to 4000)
    - `CORS_ORIGIN` - allowed CORS origin (`*` for local dev)
    - `JWT_SECRET` - **required** - HS256 signing secret for access tokens. The server will not start without it. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` - never commit the real value
    - `ACCESS_TOKEN_TTL` - how long an access token stays valid (defaults to `15m`)
    - `BCRYPT_ROUNDS` - bcrypt cost factor for password hashing (defaults to 12)


## ARCHITECTURE

The repo is a two-package monorepo (no workspaces/shared package manager
config yet) with a thin root `package.json` that only holds orchestration
scripts and the `concurrently` devDependency - it has no application code of
its own. Each half is otherwise a fully independent Node project with its
own `package.json`, dependencies and `node_modules`.

### `server/` - Express API

```
server/
├── migrations/           node-pg-migrate migration files (pgcrypto, updated_at trigger, users, tickets) - run via `npm run migrate:up`
└── src/
    ├── index.js              entry point: builds the app and starts listening
    ├── app.js                builds the Express app (middleware, routing, error handling)
    ├── config/index.js       centralizes env access (PORT, NODE_ENV, CORS_ORIGIN, DATABASE_URL) via dotenv
    ├── constants/index.js    shared constants (ticket statuses/priorities, error codes)
    ├── db.js                 Postgres connection pool (query/getPool/closePool helpers)
    ├── auth/
    │   ├── passwords.js      bcrypt hashing (hashPassword/verifyPassword)
    │   └── tokens.js         JWT sign/verify (signAccessToken/verifyAccessToken)
    ├── routes/
    │   ├── index.js          composes all routers under /api; mounts requireAuth ahead of tickets
    │   ├── health.js         /health (liveness) and /ready (readiness) - public
    │   ├── auth.js           /auth/register and /auth/me - register is public, /me requires auth
    │   └── tickets.js        /tickets, /tickets/:id, /tickets/count, /tickets/open - all require auth
    ├── services/
    │   ├── authService.js    register/login/getCurrentUser - hashing, tokens, user lookups
    │   └── ticketService.js  delegates to ticketRepository - no SQL of its own
    ├── repositories/
    │   ├── ticketRepository.js  Postgres queries for tickets (findAll/findById/countAll/countByStatus)
    │   └── userRepository.js    Postgres queries for users (findByEmail/findById/create/...)
    ├── scripts/
    │   └── seed.js           seeds sample users/tickets into Postgres
    ├── errors/
    │   └── AppError.js       typed app error (status + error code): notFound/validation/unnauthenticated/conflict
    └── middleware/
        ├── errorHandler.js   notFoundHandler + centralized errorHandler -> JSON error responses (incl. Postgres invalid-UUID -> 400)
        └── requireAuth.js    JWT bearer-token gate - verifies the token, sets req.user
```

Request flow: `index.js` boots `app.js`, which mounts the `/api` router
(`routes/index.js`) ahead of `notFoundHandler`/`errorHandler`. `routes/index.js`
mounts `health` and `auth` as public, then `requireAuth` as a bouncer before
`tickets` - so every ticket route needs a valid `Authorization: Bearer <token>`.
Routes call into `services/` for data access, which delegate to `repositories/`
for the actual Postgres queries; anything that fails throws an `AppError` (or
falls through to the generic 500 handler, with a dedicated case for
Postgres's invalid-UUID error), and `errorHandler` turns that into a
consistent `{ error: { code, message } }` JSON response.

### `web/` - React + Vite

```
web/src/
├── main.jsx                 React entry point, mounts <App />
├── App.jsx                  root component, renders the Home page
├── config.js                exports API_BASE from VITE_API_BASE (see Environment Variables)
├── lib/
│   └── api.js                fetch helpers: fetchTickets, fetchOpenTicketCount, fetchTicketById
├── pages/
│   └── Home.jsx              ticket list view - fetching, loading/error state, ticket selection
└── components/
    ├── header.jsx             page header
    └── TicketDetail.jsx       single ticket detail view
```

Data flow: pages/components call the helpers in `lib/api.js`, which prefix
requests with `API_BASE` (`web/src/config.js`) and hit relative `/api/...`
paths. In dev, `vite.config.js` proxies `/api` to the backend (target
configurable via `VITE_API_PROXY_TARGET`), so the app works unmodified
whether it's proxied through Vite or pointed at a real API host via
`VITE_API_BASE`.

## AUTH

JWT bearer-token auth.

- `POST /api/auth/register` - create an account. Body: `{ email, password, name }`. Returns `201 { user, token }`, `400` if a field is missing or the password is under 8 characters, or `409` if the email is already registered (message is deliberately generic - doesn't confirm/deny which email exists)
- `GET /api/auth/me` - returns the current user. Requires `Authorization: Bearer <token>`
- All `/api/tickets/*` routes require the same `Authorization: Bearer <token>` header
- `login` isn't wired to a route yet - `authService.js` has a working `login()`, just not mounted (following the course - not built ahead of it)

Note: the `web/` frontend doesn't send an `Authorization` header yet, so its ticket views will 401 until frontend auth is added.

## DEPLOYMENT (coming soon)

## Project structure

## API end points

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | no | Liveness check - never touches the database. Returns `{"status":"ok"}` |
| GET | `/api/ready` | no | Readiness check - queries the database for the total ticket count. Returns `{"status":"ready","tickets":<count>}`, or `503 {"status":"unavailable","error":"database unreachable"}` if the DB is down |
| POST | `/api/auth/register` | no | Create an account. Body: `{ email, password, name }`. Returns `201 { user, token }`, `400` if a field is missing or password is under 8 chars, `409` if the email is already registered |
| GET | `/api/auth/me` | yes | Returns the current user for the given token |
| GET | `/api/tickets` | yes | List all tickets |
| GET | `/api/tickets/:id` | yes | Get a single ticket by id. 404 if not found, 400 if the id isn't a valid UUID |
| GET | `/api/tickets/count` | yes | Count of tickets with `status: "open"` |
| GET | `/api/tickets/open` | yes | Same as `/api/tickets/count` (open ticket count) |

"Auth" = requires header `Authorization: Bearer <token>` (token comes from `/api/auth/register`).

