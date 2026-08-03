import { Router } from "express";
import {
  listTickets,
  countOpenTickets,
  getTicketById,
} from "../services/ticketService.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await listTickets());
  } catch (err) {
    next(err);
  }
});

// Must be declared before /:id — otherwise Express matches "count" as the
// :id param and this route is never reached.
router.get("/count", async (req, res, next) => {
  try {
    const count = await countOpenTickets();
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await getTicketById(req.params.id));
  } catch (err) {
    if (err instanceof AppError && err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
