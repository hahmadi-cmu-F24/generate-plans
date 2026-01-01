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
