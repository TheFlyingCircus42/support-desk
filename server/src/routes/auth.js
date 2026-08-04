import { Router } from "express";
import { register } from "../services/userService.js";
import { login, getCurrentUser } from "../services/authService.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, name, password } = req.body || {};
    const { user, token } = await register({ email, name, password });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const { user, token } = await login({ email, password });
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

export default router;
