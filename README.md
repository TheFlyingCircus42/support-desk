## SUPPORT DESK APP

This project is a full-stack support desk web app - using react/vite on the front end with. node Express server on the back end.  Currently no SQL - dummy data stored in memory but with plans to move to pSQL.

Currently users can view a list of sample tickets.
Working towardsa a full suite of fetures including post new tickets, delete tickets, close tickets, change ticket status add notes to tickets, user base and ticket editing permissions.

## FEATURES
-Current features 
    - View Tickets

-Planned features:
    - delete tickets
    - close tickets
    - post new tickets
    - change ticket status
    - users & auth 


## TECH STACK
- Node js
- Express
- Rect / Vite
- pSQL (coming soon)

## GETTING SET UP

- Fork and clone the repo to your local machine.

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
- http://localhost:4000/api/ready should return a JSON onbject:  {"status":"ready"}
- http://localhost:4000/api/health should return a JSON onbject:      - http://localhost:4000/api/ready should return a JSON onbject:  {"status":"ready"}

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

### `web/` (run from inside `web/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the web app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the web app with oxlint |

## ENVIRONMENT VARIABLES
    - currently no environments running at this stage. 
    - dotenv will be used to allow production/development/test environments.
    - currently defaults to PORT 4000 for back end and "development: environment.


## ARCHITECTURE

The repo is a two-package monorepo (no workspaces/shared package manager
config yet) with a thin root `package.json` that only holds orchestration
scripts and the `concurrently` devDependency - it has no application code of
its own. Each half is otherwise a fully independent Node project with its
own `package.json`, dependencies and `node_modules`.

### `server/` - Express API

```
server/src/
├── index.js              entry point: builds the app and starts listening
├── app.js                builds the Express app (middleware, routing, error handling)
├── config/index.js       centralizes env access (PORT, NODE_ENV, CORS_ORIGIN) via dotenv
├── constants/index.js    shared constants (ticket statuses/priorities, error codes)
├── routes/
│   ├── index.js          composes all routers under /api
│   ├── health.js         /health and /ready endpoints
│   └── tickets.js        /tickets endpoints
├── services/
│   └── ticketService.js  data-access layer over the ticket store
├── data/
│   └── tickets.js        in-memory ticket data (stand-in for a DB - pSQL planned)
├── errors/
│   └── AppError.js       typed app error (status + error code), with notFound/validation helpers
└── middleware/
    └── errorHandler.js   notFoundHandler + centralized errorHandler -> JSON error responses
```

Request flow: `index.js` boots `app.js`, which mounts the `/api` router
(`routes/index.js`) ahead of `notFoundHandler`/`errorHandler`. Routes call
into `services/` for data access; anything that fails throws an `AppError`
(or falls through to the generic 500 handler), and `errorHandler` turns that
into a consistent `{ error: { code, message } }` JSON response.

### `web/` - React + Vite

```
web/src/
├── main.jsx                 React entry point, mounts <App />
├── App.jsx                  root component, renders the Home page
├── config.js                exports API_BASE from VITE_API_BASE (see Environment Variables)
├── lib/
│   └── api.js                fetch helpers: fetchTickets, fetchTicketById
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

## AUTH (coming soon)

## DEPLOYMENT (coming soon)

## Project structure
## API end points

