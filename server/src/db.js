import pg from 'pg';
import config from '.config/index.js'

if (!config.databaseUrl){
    throw new Error("DATABASE_URL is not set Copy server/ .env.example to server/ .env and fill it in")
}