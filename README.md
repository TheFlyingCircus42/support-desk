## SUPPORT DESK APP

A full-stack support desk web app — React/Vite on the front end, a Node/Express
API on the back end, backed by a real PostgreSQL database (migrations + seed
script included, no mocked data).

Users register or log in, and see their own tickets — anything where they're
the requester or the assignee — via a JWT-authenticated web UI.

This project is being built by following an instructor's course (screen
recordings, not a spec doc). See [Features](#features) for what's live vs.
still planned.

## FEATURES

Current:
- User registration and login (JWT auth), with the web app restoring your
  session from a stored token on refresh
- View your own tickets — anything where you're the requester or the
  assignee — as a list and a detail view
- Ticket status/priority shown as colored badges; a "You" badge next to the
  requester/assignee field when it's you
- Sign out

Planned (not yet built — see [Notes / Known Gaps](#notes--known-gaps)):
- Create / edit / close / delete tickets
- Change ticket status from the UI
- Finer-grained ticket editing permissions (beyond requester/assignee
  visibility)
- Token refresh / longer sessions (access tokens are short-lived with no
  refresh path yet)
- Deployment (see [Deployment](#deployment))

## TECH STACK

| Layer | Tech | Version (as pinned in `package.json`) |
| --- | --- | --- |
| Runtime | Node.js | `>=20` (see `server/package.json` `engines`) |
| API framework | Express | `^5.1.0` |
| Database | PostgreSQL | no version pinned — developed against 17.x locally; needs the `pgcrypto` and `citext` extensions available (see [Database](#database)) |
| DB client | `pg` | `^8.22.0` |
| Migrations | `node-pg-migrate` | `^9.0.0` |
| Password hashing | `bcryptjs` | `^3.0.3` |
| Auth tokens | `jsonwebtoken` | `^9.0.3` |
| CORS | `cors` | `^2.8.5` |
| Env loading | `dotenv` | `^17.4.2` |
| Frontend framework | React | `^19.2.7` |
| Frontend build tool | Vite | `^8.1.1` (`@vitejs/plugin-react` `^6.0.3`) |
| Frontend linting | oxlint | `^1.71.0` |
| Root orchestration | `concurrently` | `^10.0.4` |

`web/` has no runtime dependencies beyond `react`/`react-dom` — no router, no
state/data-fetching library, no CSS framework. Styling is plain CSS files
colocated per component.

## GETTING SET UP

### Prerequisites

- **Node.js >= 20** and npm
- **PostgreSQL installed locally**, running, and reachable — the API will not
  start without a database (see [Database](#database)). Your Postgres install
  needs the `pgcrypto` and `citext` extensions available (bundled by default
  with Postgres.app, Homebrew's `postgresql` formula, and most Linux
  `postgresql-contrib` packages); the migrations create both automatically,
  but creating an extension requires a role with sufficient privilege
  (typically your local superuser role is fine).
- Fork and clone the repo to your local machine.

### Database setup

See [Database](#database) for schema details. Quick version:

```bash
createdb supportdesk
cd server
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET — see Environment Variables
npm install
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
terminal should print: "Server listening on http://localhost:4000"

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

## DATABASE

PostgreSQL, accessed via the `pg` package with a single connection pool
(`server/src/db.js`) built from `DATABASE_URL` — see
[Environment Variables](#environment-variables) for pool-connection details.
**This database is local-only right now — it is not deployed anywhere
outside this repo** (no hosted/managed Postgres instance exists yet; see
[Deployment](#deployment)).

Schema is managed entirely through `node-pg-migrate` migrations in
`server/migrations/`, applied in order:

| Migration | What it does |
| --- | --- |
| `170000000001000_enable-pgcrypto.js` | Enables the `pgcrypto` extension (provides `gen_random_uuid()` for primary keys) |
| `170000000002000_create-update-at-function.js` | Creates a `set_updated_at()` trigger function that stamps `updated_at = now()` on row update |
| `170000000003000_create-user.js` | Enables `citext`; creates the `users` table + a non-blank-email check constraint + the `updated_at` trigger |
| `170000000004000_create-tickets.js` | Creates the `ticket_status`/`ticket_priority` enum types and the `tickets` table, FKs to `users`, indexes, a non-blank-subject check constraint, and the `updated_at` trigger |
| `170000000005000_add-users-last-login.js` | Adds `users.last_login_at` |

### Schema

**`users`**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `email` | `citext` | not null, unique, case-insensitive, non-blank (check constraint) |
| `name` | `text` | not null |
| `password_hash` | `text` | not null — bcrypt hash, never returned by the API (see [Auth](#auth-model--flow)) |
| `created_at` / `updated_at` | `timestamptz` | default `now()`; `updated_at` auto-stamped by trigger |
| `last_login_at` | `timestamptz` | nullable; set on successful login |

**`tickets`**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `subject` | `text` | not null, non-blank (check constraint) |
| `description` | `text` | not null, defaults to `''` |
| `status` | `ticket_status` enum | `open` \| `pending` \| `closed`, defaults to `open` |
| `priority` | `ticket_priority` enum | `low` \| `medium` \| `high`, defaults to `medium` |
| `requester_id` | `uuid` | not null, FK → `users`, `ON DELETE CASCADE`, indexed |
| `assignee_id` | `uuid` | nullable, FK → `users`, `ON DELETE SET NULL`, indexed |
| `created_at` / `updated_at` | `timestamptz` | default `now()`; `updated_at` auto-stamped by trigger |

`status` is also indexed. A ticket is "visible" to a user if they're either
the requester or the assignee — see [Auth](#auth-model--flow) and
[Architecture](#architecture) for how that's enforced.

### Commands

From `server/` (needs `DATABASE_URL` set — loaded from `server/.env`):

```bash
npm run migrate:up     # apply all pending migrations
npm run migrate:down   # roll back the most recent migration
npm run seed            # wipe + reseed sample users/tickets (src/scripts/seed.js)
```

`npm run seed` truncates `users` (cascading into `tickets`) and inserts 4 demo
users (`alice@example.com`, `bob@example.com`, `carol@example.com`,
`dev@supportdesk.local`, all sharing the password `password123`) and 3 demo
tickets. Safe to re-run — it always starts from a clean slate.

## ENVIRONMENT VARIABLES

### `server/.env`

Copy `server/.env.example` to `server/.env` and fill in the values (never
commit `.env` — see `.gitignore`).

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string, e.g. `postgres://supportdesk:supportdesk@localhost:5432/supportdesk`. The app throws at startup if unset. |
| `PORT` | no (default `4000`) | API port |
| `CORS_ORIGIN` | no (default `*`) | Allowed CORS origin (`*` for local dev) |
| `JWT_SECRET` | **yes** | HS256 signing secret for access tokens. The server refuses to boot without it (`config/index.js`'s `requireEnv`). **Generate one with:**<br>`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`<br>Never commit the real value. |
| `ACCESS_TOKEN_TTL` | no (default `15m`) | How long an access token stays valid |
| `BCRYPT_ROUNDS` | no (default `12`) | bcrypt cost factor for password hashing (10–12 is the recommended range) |

**DB connection pooling:** `server/src/db.js` creates a single `pg.Pool`
from `DATABASE_URL` alone (`new pg.Pool({ connectionString: config.databaseUrl })`)
and reuses it for every query via `query()`/`getPool()`/`closePool()`. Pool
sizing (`max`, `idleTimeoutMillis`, etc.) is **not currently configurable** —
it runs on `pg`'s defaults (max 10 clients). There's no dedicated
pool-size/timeout env var yet; see [Notes / Known Gaps](#notes--known-gaps).

### `web/.env` (optional, gitignored — no committed `.env.example` yet)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_PROXY_TARGET` | no (default `http://localhost:4000`) | Dev-server-only: where the Vite `/api` proxy forwards requests (`vite.config.js`). Not exposed to client code. |
| `VITE_API_BASE` | no (default `''`) | Client-side API base URL (`src/config.js`). Leave empty to go through the Vite dev proxy above; set to a full origin to call a backend directly, bypassing the proxy. |

Neither web variable is a secret — nothing to generate here.

## AUTH MODEL & FLOW

JWT bearer-token auth, stateless (no server-side session store, no
revocation list).

### Backend

- `POST /api/auth/register` — `services/userService.js`. Validates
  email/name/password present and password ≥ 8 chars, hashes the password
  with bcrypt (`auth/passwords.js`, cost from `BCRYPT_ROUNDS`), inserts the
  user, and returns `{ user, token }`. `23505` (unique violation on
  `users.email`) becomes a `409 CONFLICT`.
- `POST /api/auth/login` — `services/authService.js`. Looks up the user by
  email; if not found, still runs `verifyPassword` against a hardcoded dummy
  hash before failing, so a wrong-password and an unknown-email response are
  byte-identical (no user enumeration via timing or message). On success,
  stamps `last_login_at` and returns `{ user, token }`.
- Tokens are signed HS256 JWTs (`auth/tokens.js`): `sub` = user id, a custom
  `type: "access"` claim (rejected if wrong), and an expiry from
  `ACCESS_TOKEN_TTL`. There is no refresh token — once an access token
  expires, the user has to log in again.
- `middleware/requireAuth.js` gates every route mounted after it in
  `routes/index.js` (currently just `/api/tickets/*`): parses the
  `Authorization: Bearer <token>` header, verifies the JWT, and sets
  `req.user = { id: payload.sub }`. Missing/malformed header or an
  invalid/expired token → `401 UNAUTHENTICATED`.
- `GET /api/auth/me` also requires auth and returns the current user looked
  up fresh from the token's `sub`.
- Passwords are never returned by the API — `userRepository.js` has a
  `SAFE_COLUMNS` constant excluding `password_hash`, used everywhere except
  the one internal lookup login needs.

### Frontend (`web/src/auth/`)

- `authContext.js` — plain (non-component) file exporting the `AuthContext`
  object and a `useAuth()` hook (throws if used outside `AuthProvider`) —
  split out from the component file to satisfy the `react/only-export-components`
  oxlint rule.
- `AuthProvider.jsx` — holds `token` (lazily initialized from
  `localStorage["supportdesk.token"]`), `user`, and `loading` state. On
  mount/whenever `token` changes, it calls `fetchCurrentUser(token)` to
  verify the stored token is still valid and populate `user`; any failure
  actively discards the token (`localStorage.removeItem` + reset state)
  rather than retrying it forever. Exposes `signIn`, `signUp`, and `signOut`
  (the latter is purely client-side — see the comment in the source; there's
  no server-side session to end, since the JWT is a stateless claim with no
  revocation mechanism).
- `LoginForm.jsx` — calls `signIn`/error-handles via `useAuth()`.
- `App.jsx` renders exactly one of three states based on `loading` → `user`:
  a loading placeholder, `<LoginForm />`, or the signed-in ticket UI — see
  [Architecture](#architecture) for how that's wired.
- Once signed in, `token` flows into `lib/api.js` calls
  (`fetchTickets(token)`, `fetchTicket(id, token)`, `fetchTicketCount(token)`)
  via each component reading `useAuth()` directly (not prop-drilled).

## ERROR HANDLING

### API (server)

- `errors/AppError.js` — a typed `Error` subclass carrying an HTTP `status`
  and an `ERROR_CODES` value, with static helpers: `AppError.notFound`,
  `.validation`, `.unauthenticated`, `.conflict` (each with a sane default
  status/code).
- Route handlers do no error formatting themselves — they `try/catch` and
  call `next(err)`, or throw `AppError` from the service layer. Everything
  funnels through one centralized handler.
- `middleware/errorHandler.js`:
  - `notFoundHandler` — turns any unmatched route into an `AppError.notFound`.
  - `errorHandler` — the single place that shapes error JSON:
    - `AppError` instances → `{ error: { code, message } }` at `err.status`.
    - Postgres `22P02` (invalid UUID text, e.g. `/api/tickets/not-a-uuid`) →
      `400 { error: { code: "VALIDATION_ERROR", message: "invalid id format" } }`.
    - Anything else → logged via `console.error`, `500 { error: { code: "INTERNAL_ERROR", message: "something went wrong" } }` (no internals leaked to the client).
- 404s for a ticket that exists but isn't visible to the requesting user use
  the *same* message/shape as a genuinely nonexistent id — deliberately, so
  the response can't be used to enumerate other users' ticket ids (see
  `services/ticketService.js`).

### Frontend (web)

- `lib/api.js` exports `class ApiError extends Error` (`status` + `message`)
  and a shared `apiFetch(path, { token, method, body })` helper that every
  API function is built on.
- `apiFetch` reads the response body as text first and only `JSON.parse`s if
  it's non-empty (avoids throwing on an empty body); a parse failure raises
  a clear `ApiError` instead of letting a raw `SyntaxError` propagate.
- A private `messageFrom(body, status)` helper normalizes the **two** error
  shapes the API can return (`{ error: "string" }` from older endpoints vs.
  `{ error: { code, message } }` from newer ones — see
  [API error handling](#api-server) above), checking the string form first,
  falling back to the nested `.message`, and finally to a generic
  `` `Request failed (${status})` `` if neither shape matches.
- Components (`TicketList.jsx`, `TicketDetail.jsx`, `LoginForm.jsx`) each
  hold their own `error` state, `catch`ing the thrown `ApiError` and
  rendering `err.message` directly (verbatim, no rewriting) in a `<p>`
  (login form uses `role="alert"`). There's no global error boundary or
  toast system yet — errors are handled locally per component.
- `AuthProvider.jsx` treats *any* `fetchCurrentUser` failure (network error,
  401 from an expired token, etc.) the same way: discard the stored token
  and fall back to signed-out state, rather than surfacing an error to the
  user.

## ENDPOINTS / ROUTES

All routes are mounted under `/api` (`routes/index.js`). "Auth" = requires
header `Authorization: Bearer <token>` (token comes from
`/api/auth/register` or `/api/auth/login`).

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | no | Liveness check — never touches the database. Returns `{"status":"ok"}` |
| GET | `/api/ready` | no | Readiness check — queries the database for the total ticket count (unscoped). Returns `{"status":"ready","tickets":<count>}`, or `503 {"status":"unavailable","error":"database unreachable"}` if the DB is down |
| POST | `/api/auth/register` | no | Create an account. Body: `{ email, name, password }`. Returns `201 { user, token }`; `400` if a field is missing or password is under 8 chars; `409` if the email is already registered |
| POST | `/api/auth/login` | no | Log in. Body: `{ email, password }`. Returns `200 { user, token }`; `401` (generic "invalid email or password") for either a wrong password or an unknown email |
| GET | `/api/auth/me` | yes | Returns the current user for the given token |
| GET | `/api/tickets` | yes | List tickets visible to the current user (requester or assignee), ordered by priority then creation date |
| GET | `/api/tickets/count` | yes | Count of the current user's visible tickets with `status: "open"` |
| GET | `/api/tickets/:id` | yes | Get a single visible ticket by id. `404` if it doesn't exist *or* isn't visible to this user (same response either way — see [Error Handling](#error-handling)); `400` if the id isn't a valid UUID |

No create/update/delete ticket routes exist yet — see
[Features](#features).

## ARCHITECTURE

### Repo / file layout

Two-package monorepo (no workspaces/shared package manager config) with a
thin root `package.json` holding only orchestration scripts and the
`concurrently` devDependency. Each half is otherwise a fully independent
Node project with its own `package.json`, dependencies, and `node_modules`.

```
server/
├── migrations/               node-pg-migrate files — see Database
└── src/
    ├── index.js               entry point: builds the app, starts listening
    ├── app.js                 builds the Express app (middleware, routing, error handling)
    ├── config/index.js        centralizes env access; throws at boot if JWT_SECRET is unset
    ├── constants/index.js     TICKET_STATUSES/PRIORITIES, ERROR_CODES, DEMO_PASSWORD
    ├── db.js                  Postgres connection pool (query/getPool/closePool)
    ├── auth/
    │   ├── passwords.js       bcrypt hashing (hashPassword/verifyPassword)
    │   └── tokens.js          JWT sign/verify (signAccessToken/verifyAccessToken)
    ├── routes/                EXACTLY 4 files: index.js, health.js, auth.js, tickets.js — no per-endpoint files, no error formatting in route files
    ├── services/
    │   ├── userService.js     register (validation, hashing, conflict handling)
    │   ├── authService.js     login, getCurrentUser
    │   └── ticketService.js   thin pass-through to ticketRepository, adds 404 semantics
    ├── repositories/
    │   ├── ticketRepository.js  Postgres queries, all visibility-scoped except countAll (used only by /api/ready)
    │   └── userRepository.js    Postgres queries for users; SAFE_COLUMNS excludes password_hash
    ├── scripts/
    │   ├── seed.js            seeds sample users/tickets into Postgres
    │   └── smoke-auth.js      end-to-end auth/authorization smoke suite — see Commands
    ├── errors/AppError.js     typed app error (status + error code)
    └── middleware/
        ├── errorHandler.js    notFoundHandler + centralized errorHandler
        └── requireAuth.js     JWT bearer-token gate

web/src/
├── main.jsx                  entry point, wraps <App /> in <AuthProvider>
├── App.jsx                   root component — loading/login/signed-in three-state switch
├── config.js                 exports API_BASE from VITE_API_BASE
├── Header.jsx / .css         top banner — sign-in status + sign-out
├── TicketList.jsx / .css     ticket list, ticket count, status/priority badges
├── TicketDetail.jsx / .css   single ticket view, status/priority/"You" badges
├── auth/
│   ├── authContext.js        AuthContext + useAuth() hook (no component — see Auth)
│   ├── AuthProvider.jsx      session state, signIn/signUp/signOut
│   ├── LoginForm.jsx / .css  login form
└── lib/
    └── api.js                ApiError, apiFetch, and every typed API call (login/register/fetchCurrentUser/fetchTickets/fetchTicket/fetchTicketCount)
```

### Layer flow

**Backend request flow:** `index.js` boots `app.js`, which mounts the
`/api` router (`routes/index.js`) ahead of `notFoundHandler`/`errorHandler`.
`routes/index.js` mounts `health` and `auth` as public, then `requireAuth`
as a bouncer before `tickets` — so every ticket route needs a valid
`Authorization: Bearer <token>`. Route handlers call into `services/` for
business logic, which call into `repositories/` for the actual Postgres
queries — repositories never hash passwords or make authorization decisions
themselves, they just run scoped SQL (`visibleTo()` in
`ticketRepository.js` is the one place "can this user see this ticket" is
defined). Anything that fails throws (or is wrapped as) an `AppError`, and
the centralized `errorHandler` turns that into a consistent JSON response
(see [Error Handling](#error-handling)).

**Frontend data flow:** `AuthProvider` (mounted once, in `main.jsx`) owns
`token`/`user`/`loading` and is the single source of truth for auth state,
exposed via `useAuth()`. `App.jsx` reads `loading`/`user` to decide what to
render; once signed in, `TicketList`/`TicketDetail` each call `useAuth()`
directly to get `token` (not passed down as a prop) and feed it into the
matching `lib/api.js` function, which prefixes the request with `API_BASE`
and hits a relative `/api/...` path. In dev, `vite.config.js` proxies
`/api` to the backend (target configurable via `VITE_API_PROXY_TARGET`), so
the app works unmodified whether it's proxied through Vite or pointed at a
real API host via `VITE_API_BASE`.

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
| `npm run migrate` | Run `node-pg-migrate` directly (for subcommands beyond up/down) |
| `npm run migrate:up` | Apply pending Postgres migrations (`server/migrations/`) |
| `npm run migrate:down` | Roll back the most recent Postgres migration |
| `npm run seed` | Wipe + reseed sample users/tickets (`src/scripts/seed.js`) |
| `npm run smoke:auth` | End-to-end smoke test (`src/scripts/smoke-auth.js`) — see below |

**`npm run smoke:auth`** boots the Express app in-process (no separate
server needed) and exercises it over real HTTP against an ephemeral port:
public health/ready probes, register (fresh email, weak password, duplicate
email), login (correct creds, wrong password vs. unknown email returning
byte-identical responses), the `requireAuth` gate (no token, garbage token,
valid token), and — **if the seed data is present** (`npm run migrate:up`
+ `npm run seed` beforehand) — authorization/ownership checks: a user's
ticket list is scoped correctly, cross-user ticket access 404s the same way
a nonexistent id would (IDOR check), an assignee (not just the requester)
can read a ticket, and a spoofed `?userId=` query param has no effect on
scoping. Prints a `[PASS]`/`[FAIL]`/`[SKIP]` line per check and exits
non-zero on any failure — safe to run in CI once there is one.

### `web/` (run from inside `web/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the web app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the web app with oxlint |

## Check Status in browser or via curl

- http://localhost:4000/api/health should return `{"status":"ok"}` (liveness only — never touches the database)
- http://localhost:4000/api/ready should return `{"status":"ready","tickets":<count>}` — or a 503 with `{"status":"unavailable","error":"database unreachable"}` if the database can't be reached
- http://localhost:4000/api/tickets and http://localhost:4000/api/tickets/count require `Authorization: Bearer <token>` — get a token from `POST /api/auth/login` (or `/register`) first, see [Auth](#auth-model--flow)
- http://localhost:5173/ should return a live site — a login form if you're signed out, otherwise your ticket list

## DEPLOYMENT

Coming soon — not deployed anywhere yet. The Postgres database in particular
is local-only right now (see [Database](#database)); there is no hosted
database, and no hosting/CI config exists for either `server/` or `web/`.

## Notes / Known Gaps

Called out inline above, collected here for visibility:

- **No configurable DB pool size.** `db.js` only takes `DATABASE_URL`; pool
  sizing/timeouts use `pg`'s defaults, with no env var to tune them yet.
- **No `web/.env.example` committed.** `server/.env.example` exists and is
  tracked; the equivalent for `web/` (`VITE_API_PROXY_TARGET`,
  `VITE_API_BASE`) doesn't, even though a local `web/.env` is in use. Neither
  variable is a secret, so this is a documentation gap, not a security one.
- **No automated test suite** beyond the manual `smoke:auth` script —
  expected at this stage of the course, not a regression.
- **Two bcrypt packages present in `node_modules`** (`bcrypt` and
  `bcryptjs`) — only `bcryptjs` is a declared dependency and the one
  actually imported (`auth/passwords.js`); `bcrypt` is presumed transitive.
  Not currently a problem, just worth being aware of if you ever see an
  import from `"bcrypt"` (no `s`) show up — that would silently resolve
  instead of failing loudly.
- **No ticket create/update/delete routes yet** — see [Features](#features)
  and [Endpoints](#endpoints--routes).
- **No deployment target configured** — see [Deployment](#deployment).
