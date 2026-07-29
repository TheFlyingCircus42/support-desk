import { Router } from "express";
import { countOpenTickets } from "../services/ticketService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json({ count: await countOpenTickets() });
  } catch (err) {
    next(err);
  }
});

export default router;
