import { createApp } from "../backend/src/app";
import { connectDB } from "../backend/src/db";

const app = createApp();

let dbReady: Promise<void> | undefined;

async function ensureDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  if (!dbReady) {
    dbReady = connectDB(uri).then(() => undefined);
  }
  await dbReady;
}

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    return app(req, res);
  } catch (err) {
    console.error("API initialization failed:", err);
    return res.status(500).json({
      error: "Server error",
      message: "Failed to initialize API",
    });
  }
}
