import express from "express";
import { patientsRouter } from "./routes/patients";
import { providersRouter } from "./routes/providers";
import { ordersRouter } from "./routes/orders";
import { carePlansRouter } from "./routes/carePlans";
import cors from "cors";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "http://localhost:5173" }));

  app.use("/", carePlansRouter);
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/patients", patientsRouter);
  app.use("/providers", providersRouter);
  app.use("/orders", ordersRouter);

  return app;
}
