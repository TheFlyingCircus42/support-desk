import { Router } from "express"
import { register } from "../services/authService.js"
import { requireAuth } from "../middleware/requireAuth.js";
import { getCurrentUser } from "../services/authService.js";

const router = Router();

router.use("/", healthRouter); //public
router.use("/auth", authRouter); //public
// /tickets/count and /tickets/open must be mounted before the generic /tickets
// routes below - otherwise ticketByIdRouter's GET /:id would match "count"/"open"
// as an id and swallow these requests.
router.use(requireAuth) //bouncer
router.use("tickets", ticketsRouter);

export default router;

/// refactor the below out 
import { Router } from "express";
import ticketsRouter from "./tickets.js";
import ticketByIdRouter from "./ticketById.js";
import healthRouter from "./health.js";
import ticketCountRouter from "./ticketCount.js";
import ticketOpenRouter from "./ticketOpen.js";
import registerRouter from "./register.js";
import { requireAuth } from "../middleware/requireAuth.js";

router.use(healthRouter);
router.use("/auth/register", registerRouter);
// /tickets/count and /tickets/open must be mounted before the generic /tickets
// routes below - otherwise ticketByIdRouter's GET /:id would match "count"/"open"
// as an id and swallow these requests.
router.use("/tickets/count", ticketCountRouter);
router.use("/tickets/open", ticketOpenRouter);
router.use("/tickets", ticketByIdRouter);
router.use("/tickets", ticketsRouter);

export default router;
