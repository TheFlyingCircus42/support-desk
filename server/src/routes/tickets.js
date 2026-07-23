import { Router } from "express";
import { tickets } from "../data/tickets.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(tickets);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return res.status(404).json({ error: `Ticket ${req.params.id} not found` });
  }

  res.json(ticket);
});

export default router;
