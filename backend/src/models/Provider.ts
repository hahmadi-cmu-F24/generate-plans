import mongoose, { InferSchemaType } from "mongoose";

const ProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    nameKey: { type: String, required: true, trim: true }, // 👈 normalized
    npi: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ProviderSchema.index({ npi: 1 }, { unique: true });       // one NPI per provider
ProviderSchema.index({ nameKey: 1 }, { unique: true });   // one provider per name (your “same provider” rule)

export type Provider = InferSchemaType<typeof ProviderSchema>;
export const ProviderModel =
  mongoose.models.Provider ?? mongoose.model("Provider", ProviderSchema);
