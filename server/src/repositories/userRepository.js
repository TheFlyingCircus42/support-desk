import { query } from "../db.js"

// safe columns to return from API (No Password_hash)
const SAFE_COLUMNS = "id, email, name, created_at, last_login_at";

// find by email
export async function findByEmail(email) {
    const { rows } = await query(`
        SELECT ${SAFE_COLUMNS} from users
        WHERE email =$1` ,
        [email])
    return rows[0] || null;
}

//find by id
export async function findById(id) {
    const { rows } = await query(`
        SELECT ${SAFE_COLUMNS} from users
        WHERE id = $1`, 
        [id])
    return rows[0] || null;    
}

//findByEmailWithHash
//only file that returns password hash
export async function findByEmailWithHash(email) {
    const { rows } = await query(
        `SELECT id, email, name, password_hash
        FROM users 
        WHERE email =$1` , 
        [email]
    )
    return rows[0] || null;
}


//create
// TAKE AN ALREADY HASHED PASSWORD (hashing is the services job - not the repositories)
export async function create({email, name, passwordHash}) {
    const { rows }= await query(
        `INSERT INTO users (email, name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING ${SAFE_COLUMNS}` ,
        [email, name, passwordHash]
    )
    return rows[0];
}


//touchLastLogin()
export async function touchLastLogin(id) {
    await query(`UPDATE users
        SET last_login_at = now()
        WHERE id = $1` ,
    [id])
}
