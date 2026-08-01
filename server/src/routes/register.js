import { Router } from "express";
import { registerUser } from "../services/userService.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
