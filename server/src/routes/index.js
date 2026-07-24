import { Router } from "express";
import ticketsRouter from "./tickets.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/tickets", ticketsRouter);

export default router;
