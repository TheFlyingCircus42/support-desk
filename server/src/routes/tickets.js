import { Router } from "express";
import { listTickets, getTicketById } from "../services/ticketService.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(listTickets());
});

router.get("/:id", (req, res) => {
  try {
    res.json(getTicketById(req.params.id));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
