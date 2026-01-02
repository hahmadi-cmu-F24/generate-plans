import { Router } from "express";
import { PatientModel } from "../models/Patient";
import { createPatientSchema } from "../validators/patient";
import { getDuplicateField, isMongoDuplicateKeyError } from "../lib/httpErrors";

export const patientsRouter = Router();

patientsRouter.post("/", async (req, res) => {
  const parsed = createPatientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    // If patient exists, reuse (idempotent) unless it conflicts
    const existing = await PatientModel.findOne({ mrn: parsed.data.mrn }).lean();
    if (existing) {
    const sameFirst = existing.firstName.trim().toLowerCase() === parsed.data.firstName.trim().toLowerCase();
    const sameLast = existing.lastName.trim().toLowerCase() === parsed.data.lastName.trim().toLowerCase();

    if (!sameFirst || !sameLast) {
        return res.status(409).json({
        error: "Duplicate entity",
        message: "MRN already exists with a different patient name. Please verify duplicate patient.",
        });
    }

    return res.status(200).json({
        id: existing._id.toString(),
        firstName: existing.firstName,
        lastName: existing.lastName,
        mrn: existing.mrn,
    });
    }
    const created = await PatientModel.create(parsed.data);
    return res.status(201).json({
      id: created._id.toString(),
      firstName: created.firstName,
      lastName: created.lastName,
      mrn: created.mrn,
    });
  } catch (err) {
    if (isMongoDuplicateKeyError(err)) {
      const field = getDuplicateField(err) ?? "unique field";
      return res.status(409).json({
        error: "Duplicate entity",
        message: `A patient with the same ${field} already exists.`,
      });
    }
    return res.status(500).json({
      error: "Server error",
      message: "Something went wrong.",
    });
  }
});
