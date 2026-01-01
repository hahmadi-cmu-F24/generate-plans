import mongoose, { InferSchemaType } from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    // exactly 6 digits as a string to preserve leading zeros
    mrn: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Enforce uniqueness at the DB level
PatientSchema.index({ mrn: 1 }, { unique: true });

export type Patient = InferSchemaType<typeof PatientSchema>;
export const PatientModel =
  mongoose.models.Patient ?? mongoose.model("Patient", PatientSchema);
