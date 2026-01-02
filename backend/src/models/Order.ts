import mongoose, { InferSchemaType } from "mongoose";

const ICD10_REGEX = /^[A-TV-Z][0-9][0-9A-TV-Z](\.[0-9A-TV-Z]{1,4})?$/i;

const OrderSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },

    medicationName: { type: String, required: true, trim: true, maxlength: 120 },
    // store normalized versions for deterministic duplicate checks
    medicationNameNorm: { type: String, required: true, trim: true, maxlength: 120 },

    primaryDiagnosis: { type: String, required: true, trim: true, maxlength: 16 },
    primaryDiagnosisNorm: { type: String, required: true, trim: true, maxlength: 16 },

    additionalDiagnoses: { type: [String], default: [] },
    medicationHistory: { type: [String], default: [] },

    // preprocessed text pasted by user
    patientRecordsText: { type: String, required: true, trim: true, maxlength: 200_000 },
  },
  { timestamps: true }
);

// Duplicate order rule (deterministic)
OrderSchema.index(
  { patientId: 1, medicationNameNorm: 1, primaryDiagnosisNorm: 1 },
  { unique: true }
);

// Optional: basic server-side schema guardrails
OrderSchema.path("primaryDiagnosis").validate((v: string) => ICD10_REGEX.test(v), "Invalid ICD-10");
OrderSchema.path("additionalDiagnoses").validate(
  (arr: string[]) => arr.every((x) => ICD10_REGEX.test(x)),
  "Invalid ICD-10 in additionalDiagnoses"
);

export type Order = InferSchemaType<typeof OrderSchema>;
export const OrderModel =
  mongoose.models.Order ?? mongoose.model("Order", OrderSchema);

export function normalize(s: string) {
  return s.trim().toLowerCase();
}
