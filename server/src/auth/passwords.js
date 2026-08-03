// implementation of bcrypt
// hash a password for storage and check an attempt against a stored hash

import bcrypt from "bcryptjs";
import config from "../config/index.js";

// hash
export async function hashPassword(plaintext) {
    if (typeof plaintext !== "string" || plaintext.length < 8) {
        throw new Error("password must be at least 8 characters")
    }
    return bcrypt.hash(plaintext, config.bcryptRounds);
}

// verify
export async function verifyPassword(plaintext, hash) {
    if (!plaintext || !hash) return false;
    return bcrypt.compare(plaintext, hash);
}
