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

  try {
    const existing = await ProviderModel.findOne({ npi: parsed.data.npi }).lean();
    if (existing) {
    const sameName = existing.name.trim().toLowerCase() === parsed.data.name.trim().toLowerCase();

    if (!sameName) {
        return res.status(409).json({
        error: "Duplicate entity",
        message: "NPI already exists with a different provider name. Please verify duplicate provider entry.",
        });
    }

    return res.status(200).json({
        id: existing._id.toString(),
        name: existing.name,
        npi: existing.npi,
    });
    }
    const created = await ProviderModel.create(parsed.data);
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
    return res.status(500).json({
      error: "Server error",
      message: "Something went wrong.",
    });
  }
});
