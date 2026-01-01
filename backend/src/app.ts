import express from "express";
import { patientsRouter } from "./routes/patients";
import { providersRouter } from "./routes/providers";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/patients", patientsRouter);
  app.use("/providers", providersRouter);

  return app;
}
