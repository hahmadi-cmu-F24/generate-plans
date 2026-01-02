import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  mrn: z.string().trim().regex(/^\d{6}$/, "MRN must be exactly 6 digits"),

  // Expect YYYY-MM-DD from <input type="date">
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD")
    .refine((s) => {
      const d = new Date(`${s}T00:00:00.000Z`);
      if (Number.isNaN(d.getTime())) return false;
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      return d.getTime() <= todayUTC.getTime();
    }, "DOB cannot be in the future"),
});
