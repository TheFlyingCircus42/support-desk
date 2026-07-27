import { Router } from "express";
import { countOpenTickets } from "../services/ticketService.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    res.json({ count: countOpenTickets() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
