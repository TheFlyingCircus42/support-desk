import { Router } from "express";
import ticketsRouter from "./tickets.js";
import healthRouter from "./health.js";
import ticketCountRouter from "./ticketCount.js";

const router = Router();

router.use(healthRouter);
router.use("/tickets/count", ticketCountRouter);
router.use("/tickets", ticketsRouter);

export default router;
