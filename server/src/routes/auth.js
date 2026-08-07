import { Router } from "express";
import { register } from "../services/userService.js";
import { login, getCurrentUser, refresh, revokeRefreshToken } from "../services/authService.js";
import { requireAuth } from "../middleware/requireAuth.js";
import config from "../config/index.js";

const router = Router();

const REFRESH_COOKIE_NAME = "supportdesk_refresh";

// Scoped to /api/auth so the browser only ever sends this cookie to auth
// endpoints, not to every API request.
function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.env === "production",
    maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, name, password } = req.body || {};
    const { user, token, refreshToken } = await register({ email, name, password });
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const { user, token, refreshToken } = await login({ email, password });
    setRefreshCookie(res, refreshToken);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
    try {
        res.json({ user: await getCurrentUser(req.user.id) });
    } catch (err) {
        next(err);
    }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { user, token, refreshToken } = await refresh(req.cookies.supportdesk_refresh);
    setRefreshCookie(res, refreshToken);
    res.json({ user, token });
  } catch (err) {
    // A rejected refresh should not leave a dead cookie sitting in the browser.
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    next(err);
  }
});

// No requireAuth here on purpose: a client with an expired access token but
// a still-cookied refresh token must still be able to sign out cleanly.
router.post("/logout", async (req, res, next) => {
  try {
    await revokeRefreshToken(req.cookies.supportdesk_refresh);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
