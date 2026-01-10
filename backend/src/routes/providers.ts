import { Router } from "express";
import { ProviderModel } from "../models/Provider";
import { createProviderSchema } from "../validators/provider";
import { getDuplicateField, isMongoDuplicateKeyError } from "../lib/httpErrors";

export const providersRouter = Router();

providersRouter.post("/", async (req, res) => {
  const parsed = createProviderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const name = parsed.data.name.trim();
  const npi = parsed.data.npi.trim();
  const nameKey = name.toLowerCase(); // ✅ normalized identity key

  try {
    // Enforce: same provider name must keep same NPI
    const existingByName = await ProviderModel.findOne({ nameKey }).lean();
    if (existingByName) {
      if (existingByName.npi !== npi) {
        return res.status(409).json({
          error: "Duplicate entity",
          message: "Provider already exists with a different NPI. Use the existing NPI.",
        });
      }
      return res.status(200).json({
        id: existingByName._id.toString(),
        name: existingByName.name,
        npi: existingByName.npi,
      });
    }

    // Create new provider
    const created = await ProviderModel.create({ name, nameKey, npi });
    return res.status(201).json({
      id: created._id.toString(),
      name: created.name,
      npi: created.npi,
    });
  } catch (err) {
    if (isMongoDuplicateKeyError(err)) {
      const field = getDuplicateField(err) ?? "unique field";
      return res.status(409).json({
        error: "Duplicate entity",
        message: `A provider with the same ${field} already exists.`,
      });
    }

    // ✅ helpful debug (optional, but useful in tests)
    return res.status(500).json({
      error: "Server error",
      message: err instanceof Error ? err.message : "Something went wrong.",
    });
  }
});
