import { Router } from "express";
import { countTickets } from "../services/ticketService.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ready", tickets: countTickets() });
});

router.get("/ready", (req, res) => {
  res.json({ status: "ready" });
});

export default router;
