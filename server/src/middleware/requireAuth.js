// answers one question... who are you?

import { verifyAccessToken } from "../auth/tokens.js";
import { AppError } from "../errors/AppError.js";


export function requireAuth(req, res, next) {
    // whole head to jwt.verify... most common mistake
    // split the header.... value is "Bearer ejshYfhbdu...".... TWO space spearated parts

    const [scheme, token] = (req.get("authorization") || "").split(" ");
    // when your frontend send a request.... it attached a header that looks like...
    // Authorization: Bearer ejshYfhbdu....

    if (scheme !== "Bearer" || !token) {
        return next(AppError.unauthenticated("authentification failed"));
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub };
        return next();
    } catch {
        return next(AppError.unauthenticated("invalid or expired token"));
    }
}
