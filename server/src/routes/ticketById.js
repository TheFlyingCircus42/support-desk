import { Router } from "express";
import { getTicketById } from "../services/ticketService.js";

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await getTicketById(req.params.id));
  } catch (err) {
    next(err);
  }
});

export default router;
