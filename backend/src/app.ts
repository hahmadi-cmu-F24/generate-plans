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
  
  app.use((err: any, req: any, res: any, next: any) => {
    const status = err?.statusCode || err?.status || 500;

    // Never leak stack traces or internals to the client
    const message =
      status === 429
        ? "LLM quota exceeded or billing not enabled."
        : "Server error";

    res.status(status).json({
      error: "REQUEST_FAILED",
      message,
    });
  });

  return app;
}
