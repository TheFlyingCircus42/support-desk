import { Router } from "express";
import { tickets } from "../data/tickets.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(tickets);
});

export default router;
