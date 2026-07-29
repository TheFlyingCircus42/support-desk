import { Router } from "express";
import ticketsRouter from "./tickets.js";
import ticketByIdRouter from "./ticketById.js";
import healthRouter from "./health.js";
import ticketCountRouter from "./ticketCount.js";
import ticketOpenRouter from "./ticketOpen.js";

const router = Router();

router.use(healthRouter);
router.use("/tickets/count", ticketCountRouter);
router.use("/tickets/open", ticketOpenRouter);
router.use("/tickets", ticketByIdRouter);
router.use("/tickets", ticketsRouter);

export default router;
