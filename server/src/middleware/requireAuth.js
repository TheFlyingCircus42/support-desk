import { verifyAccessToken } from "../auth/tokens.js";
import { AppError } from "../errors/AppError.js";

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(AppError.unnauthenticated());
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    next(AppError.unnauthenticated("invalid or expired token"));
  }
}
