import { Router } from "express";
import { countTickets } from "../services/ticketService.js";

const router = Router();

// Liveness only — deliberately never touches the database, so a DB blip doesn't get an otherwise-healthy process killed by an orchestrator.
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/ready", async (req, res) => {
  try {
    const tickets = await countTickets();
    res.json({ status: "ready", tickets });
  } catch (err) {
    res.status(503).json({ status: "unavailable", error: "database unreachable" });
  }
});

export default router;
