import { z } from "zod";

export const createProviderSchema = z.object({
  name: z.string().trim().min(1).max(120),
  npi: z.string().trim().regex(/^\d{10}$/, "NPI must be exactly 10 digits"),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
