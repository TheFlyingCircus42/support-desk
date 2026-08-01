// JWT sign and verify
// mint a shortlived signed claim, and verify one

import jwt from "jsonwebtoken"
import config from "../config/index.js"

const TOKEN_TYPE_ACCESS = "access";

export function signAccessToken(user){
    return jwt.sign({ type: TOKEN_TYPE_ACCESS }, config.jwtSecret, {
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
