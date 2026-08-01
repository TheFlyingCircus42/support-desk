import { Router } from "express";
import { register, getCurrentUser } from "../services/authService.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// login() is fully built in authService.js but deliberately not wired yet -
// avoids diverging from the instructor before that part of the course. To enable:
//   import { login } from "../services/authService.js";
//   router.post("/login", async (req, res, next) => {
//     try { res.json(await login(req.body)); } catch (err) { next(err); }
//   });

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    res.json({ user: await getCurrentUser(req.user.id) });
  } catch (err) {
    next(err);
  }
});

export default router;
