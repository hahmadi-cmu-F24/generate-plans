import mongoose from "mongoose";

export async function connectTestDB() {
  const base = process.env.MONGODB_URI;
  if (!base) throw new Error("Missing MONGODB_URI");

  // Force a dedicated test DB
  const testUri = base.includes("?")
    ? base.replace(/\/([^/?]+)(\?|$)/, "/careplan_test$2")
    : base.replace(/\/([^/?]+)$/, "/careplan_test");

  await mongoose.connect(testUri);
}

export async function clearTestDB() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
}
