import pg from 'pg';
import config from './config/index.js'

if (!config.databaseUrl){
    throw new Error("DATABASE_URL is not set Copy server/ .env.example to server/ .env and fill it in")
}

const pool = new pg.Pool ({ connectionString: config.databaseUrl });

pool.on("error", (err) => {
    console.error("Unexpected idle client error" , err);
})

export function query(text, params){
    return pool.query(text, params);
}

export function getPool(){
    return pool
}

export async function closePool(){
    await pool.end();
} 