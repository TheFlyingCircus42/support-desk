// implementation of bcrypt
// hash a password storage and check an attept against the stored hash

import bcrypt from "bcryptjs"
import config from "../config/index.js"
import { AppError } from "../errors/AppError.js"

// --> hash -->
export async function hashPassword(plaintext) {
    if (typeof plaintext !== "string" || plaintext.length <8) {
        throw AppError.validation("password must be at least 8 characters")
    }
    return bcrypt.hash(plaintext, config.bcryptRounds);
}

export async function verifyPassword(plaintext, hash) {
        if(!plaintext || !hash ) return false;
    return bcrypt.compare(plaintext, hash);    
}