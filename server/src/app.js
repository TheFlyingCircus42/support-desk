import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import config from "./config/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export function buildApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
