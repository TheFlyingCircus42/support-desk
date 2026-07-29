import { Router } from "express";
import { getTicketById } from "../services/ticketService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next();
  }

  try {
    res.json(await getTicketById(id));
  } catch (err) {
    next(err);
  }
});

export default router;
