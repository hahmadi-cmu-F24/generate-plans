import { Router } from "express";
import mongoose from "mongoose";
import { createOrderSchema } from "../validators/order";
import { OrderModel, normalize } from "../models/Order";
import { PatientModel } from "../models/Patient";
import { ProviderModel } from "../models/Provider";
import { getDuplicateField, isMongoDuplicateKeyError } from "../lib/httpErrors";

export const ordersRouter = Router();

ordersRouter.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const {
    patientId,
    providerId,
    medicationName,
    primaryDiagnosis,
    additionalDiagnoses,
    medicationHistory,
    patientRecordsText,
  } = parsed.data;

  // Validate object ids early
  if (!mongoose.isValidObjectId(patientId) || !mongoose.isValidObjectId(providerId)) {
    return res.status(400).json({ error: "Invalid input", message: "Invalid patientId/providerId" });
  }

  // Ensure referenced entities exist (deterministic, no silent inconsistencies)
  const [patient, provider] = await Promise.all([
    PatientModel.findById(patientId).lean(),
    ProviderModel.findById(providerId).lean(),
  ]);

  if (!patient) return res.status(404).json({ error: "Not found", message: "Patient not found" });
  if (!provider) return res.status(404).json({ error: "Not found", message: "Provider not found" });

  try {
    const created = await OrderModel.create({
      patientId,
      providerId,
      medicationName,
      medicationNameNorm: normalize(medicationName),
      primaryDiagnosis,
      primaryDiagnosisNorm: normalize(primaryDiagnosis),
      additionalDiagnoses,
      medicationHistory,
      patientRecordsText,
    });

    return res.status(201).json({
      id: created._id.toString(),
      patientId: created.patientId.toString(),
      providerId: created.providerId.toString(),
      medicationName: created.medicationName,
      primaryDiagnosis: created.primaryDiagnosis,
    });
  } catch (err) {
    if (isMongoDuplicateKeyError(err)) {
      const field = getDuplicateField(err) ?? "order key";
      return res.status(409).json({
        error: "Duplicate entity",
        message:
          "This order looks like a duplicate for the same patient, medication, and diagnosis.",
        field,
      });
    }
    return res.status(500).json({ error: "Server error", message: "Something went wrong." });
  }
});
