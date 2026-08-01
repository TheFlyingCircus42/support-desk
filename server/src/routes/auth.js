import { Router } from "express";
import { registerUser } from "../services/userService";
import { requireAuth } from "../middleware/requireAuth";
import { getCurrentUser } from "../services/authService";

const router = Router ();

router.post("/register", async (req, res, next ) => {
    try {
        const { email, name, password } = req.body || {};
        const { user, token } = await register ({ emaail, name, password});
        res.status(201).json({ user, token });
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