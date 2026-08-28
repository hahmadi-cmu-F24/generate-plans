import express from "express";
import { patientsRouter } from "./routes/patients";
import { providersRouter } from "./routes/providers";
import { ordersRouter } from "./routes/orders";
import { carePlansRouter } from "./routes/carePlans";
import cors from "cors";

function getAllowedOrigins(): string[] {
  const origins = ["http://localhost:5173"];

  if (process.env.FRONTEND_URL) origins.push(process.env.FRONTEND_URL);
  if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) {
    origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
  }

  return origins;
}

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin requests and server-to-server calls omit Origin.
        if (!origin) return callback(null, true);

        const allowed = getAllowedOrigins();
        if (allowed.includes(origin)) return callback(null, true);

        // Allow Vercel preview and production URLs.
        if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) {
          return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
      },
    })
  );

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
