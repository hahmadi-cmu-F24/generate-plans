import mongoose, { InferSchemaType } from "mongoose";

const CarePlanSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    planText: { type: String, required: true, maxlength: 200_000 },
    // optional metadata (nice for debugging, not PHI-heavy)
    generator: { type: String, required: true, default: "mock" }, // "mock" | "openai"
    promptVersion: { type: String, required: true, default: "v1" },
  },
  { timestamps: true }
);

CarePlanSchema.index({ orderId: 1 }, { unique: true });

export type CarePlan = InferSchemaType<typeof CarePlanSchema>;
export const CarePlanModel =
  mongoose.models.CarePlan ?? mongoose.model("CarePlan", CarePlanSchema);
