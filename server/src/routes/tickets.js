import { Router } from "express";
import {
  listTicketsFor,
  countOpenTicketsFor,
  getTicketByIdFor,
} from "../services/ticketService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await listTicketsFor(req.user.id));
  } catch (err) {
    next(err);
  }
});

// Must be declared before /:id — otherwise Express matches "count" as the
// :id param and this route is never reached.
router.get("/count", async (req, res, next) => {
  try {
    res.json({ count: await countOpenTicketsFor(req.user.id) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await getTicketByIdFor(req.params.id, req.user.id));
  } catch (err) {
    next(err);
  }
});

export default router;
