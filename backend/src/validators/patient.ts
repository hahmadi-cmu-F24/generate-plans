import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  mrn: z.string().trim().regex(/^\d{6}$/, "MRN must be exactly 6 digits"),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
