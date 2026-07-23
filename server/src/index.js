import express from "express";
import cors from "cors";
import ticketsRouter from "./routes/tickets.js";
import config from "./config/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tickets", ticketsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const port = config.port;

app.listen(port, () => {
  console.log(`Support-desk API listening on http://localhost:${port}`);
});
