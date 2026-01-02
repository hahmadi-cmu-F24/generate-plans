// Force mock LLM for all tests
process.env.LLM_PROVIDER = "mock";

import mongoose from "mongoose";
import { PatientModel } from "../models/Patient";
import { ProviderModel } from "../models/Provider";
import { OrderModel } from "../models/Order";

export async function connectTestDB() {
  
  const base = process.env.MONGODB_URI;
  if (!base) throw new Error("Missing MONGODB_URI");

  // simplest + reliable: build test URI explicitly
  const testUri = "mongodb://localhost:27017/careplan_test";

  await mongoose.connect(testUri);

  // ✅ Ensure all indexes exist before running tests
  await Promise.all([
    PatientModel.syncIndexes(),
    ProviderModel.syncIndexes(),
    OrderModel.syncIndexes(),
  ]);
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
