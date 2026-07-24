import { Router } from "express";
import ticketsRouter from "./tickets.js";
import healthRouter from "./health.js";

const router = Router();

router.use(healthRouter);
router.use("/tickets", ticketsRouter);

export default router;
