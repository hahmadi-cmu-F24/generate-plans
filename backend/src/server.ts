import "dotenv/config";
import { createApp } from "./app";
import { connectDB } from "./db";

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI in .env");

  await connectDB(uri);

  const app = createApp();
  const port = Number(process.env.PORT ?? 3001);

  app.listen(port, () => {
    console.log(`✅ API running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server");
  console.error(err);
  process.exit(1);
});
