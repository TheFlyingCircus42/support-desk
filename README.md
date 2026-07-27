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
```bash
cd server
node src/index.js
```

- Fork and clone the repo to your local machine. 

- from the project root:
```bash
cd server
npm install
```

- from the project root:
    --> cd /web
        --> run:  npm install

    ## Spin up
    -->  from /server
        --> run: node src/index.js
            --> terminal should print: 
                "Support-desk API listening on http://localhost:4000"

    --> from /web
        --> run: npm run dev 
            --> VITE should print in terminal :
                  VITE v8.1.5  ready in 237 ms
            ➜  Local:   http://localhost:5173/

    ## Check Status in browser or via curl cmd
    - http://localhost:4000/api/ready should return a JSON onbject:  {"status":"ready"}
    - http://localhost:4000/api/health should return a JSON onbject:      - http://localhost:4000/api/ready should return a JSON onbject:  {"status":"ready"}

    - http://localhost:5173/ should return a live site. Landing page is curently a ticket list view. 

## ENVIRONMENT VARIABLES
    - currently no environments running at this stage. 
    - dotenv will be used to allow production/development/test environments.
    - currently defaults to PORT 4000 for back end and "development: environment.


## ARCHITECTURE
    - 

## AUTH (coming soon)

## DEPLOYMENT (coming soon)

## Project structure
## API end points




