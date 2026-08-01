import { Router } from "express";
import { listTickets, getTicketById, countOpenTickets } from "../services/ticketService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await listTickets());
  } catch (err) {
    next(err);
  }
});

// /count and /open must come before /:id below - otherwise :id would match
// "count"/"open" as an id and swallow these requests.
router.get("/count", async (req, res, next) => {
  try {
    res.json({ count: await countOpenTickets() });
  } catch (err) {
    next(err);
  }
});

router.get("/open", async (req, res, next) => {
  try {
    res.json({ count: await countOpenTickets() });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await getTicketById(req.params.id));
  } catch (err) {
    next(err);
  }
});

export default router;
