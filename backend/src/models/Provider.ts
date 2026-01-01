import mongoose, { InferSchemaType } from "mongoose";

const ProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    // exactly 10 digits as a string to preserve leading zeros
    npi: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Enforce uniqueness at the DB level
ProviderSchema.index({ npi: 1 }, { unique: true });

export type Provider = InferSchemaType<typeof ProviderSchema>;
export const ProviderModel =
  mongoose.models.Provider ?? mongoose.model("Provider", ProviderSchema);
