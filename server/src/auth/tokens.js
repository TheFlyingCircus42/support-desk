// JWT sign and verify
// mint a short-lived signed claim, and verify one

import jwt from "jsonwebtoken"
import crypto from "node:crypto"
import config from "../config/index.js"

const TOKEN_TYPE_ACCESS = "access";

export function signAccessToken(user) {
    return  jwt.sign({ type: TOKEN_TYPE_ACCESS }, config.jwtSecret, {
        subject: user.id,
        expiresIn: config.accessTokenTtl,
        algorithm: "HS256",
    });
}

export function verifyAccessToken(token) {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    if (payload.type !== TOKEN_TYPE_ACCESS) {
        throw new jwt.JsonWebTokenError(`expected an ${TOKEN_TYPE_ACCESS} token`)
    }
    return payload;
}

// Refresh tokens are opaque random values, not JWTs, hashed with sha256 -
// NOT bcrypt. This is a deliberate asymmetry with passwords.js, same as the
// hashPassword-throws/verifyPassword-returns-false split there: bcrypt is
// slow on purpose, to punish guessing a low-entropy password. A refresh
// token has 512 bits of entropy - it cannot be guessed - so slow hashing
// buys nothing here and only taxes every refresh call. sha256 gives a fast,
// deterministic digest suitable for an indexed DB lookup. Do not "fix" this
// to use bcrypt for consistency with passwords.js - it would be a regression.

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function verifyRefreshToken(rawToken, storedHash) {
    return hashRefreshToken(rawToken) === storedHash;
}
