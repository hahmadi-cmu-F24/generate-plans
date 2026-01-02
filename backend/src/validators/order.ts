import { z } from "zod";

const ICD10 = z
  .string()
  .trim()
  .regex(/^[A-TV-Z][0-9][0-9A-TV-Z](\.[0-9A-TV-Z]{1,4})?$/i, "Invalid ICD-10");

export const createOrderSchema = z.object({
  patientId: z.string().trim().min(1),
  providerId: z.string().trim().min(1),

  medicationName: z.string().trim().min(1).max(120),
  primaryDiagnosis: ICD10,

  additionalDiagnoses: z.array(ICD10).default([]),
  medicationHistory: z.array(z.string().trim().min(1).max(200)).default([]),

  patientRecordsText: z.string().trim().min(1).max(200_000),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
