import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import ticketsRouter from "./tickets.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use("/", healthRouter); // public
router.use("/auth", authRouter); // public

router.use(requireAuth); // bouncer - everything below requires a valid access token

router.use("/tickets", ticketsRouter);

export default router;
