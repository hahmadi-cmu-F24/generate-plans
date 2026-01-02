import { Router } from "express";
import { PatientModel } from "../models/Patient";
import { createPatientSchema } from "../validators/patient";
import { getDuplicateField, isMongoDuplicateKeyError } from "../lib/httpErrors";

export const patientsRouter = Router();

function norm(s: string) {
  return s.trim().toLowerCase();
}

function dateOnlyUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

patientsRouter.post("/", async (req, res) => {
  const parsed = createPatientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { firstName, lastName, mrn, dob } = parsed.data;

  // Parse DOB string -> Date at UTC midnight
  const dobDate = new Date(`${dob}T00:00:00.000Z`);

  try {
    // 1) MRN idempotency (existing patient reuse unless conflicts)
    const existingByMrn = await PatientModel.findOne({ mrn }).lean();
    if (existingByMrn) {
      const sameFirst = norm(existingByMrn.firstName) === norm(firstName);
      const sameLast = norm(existingByMrn.lastName) === norm(lastName);

      // compare date-only
      const existingDob = dateOnlyUTC(new Date(existingByMrn.dob));
      const incomingDob = dateOnlyUTC(dobDate);
      const sameDob = existingDob.getTime() === incomingDob.getTime();

      if (!sameFirst || !sameLast || !sameDob) {
        return res.status(409).json({
          error: "Duplicate entity",
          message:
            "MRN already exists with different patient demographics (name and/or DOB). Please verify duplicate patient.",
        });
      }

      return res.status(200).json({
        id: existingByMrn._id.toString(),
        firstName: existingByMrn.firstName,
        lastName: existingByMrn.lastName,
        mrn: existingByMrn.mrn,
        dob: new Date(existingByMrn.dob).toISOString().slice(0, 10),
      });
    }

    // 2) Potential duplicate warning: same name + DOB but different MRN
    const existingSameIdentity = await PatientModel.findOne({
      firstName: new RegExp(`^${firstName.trim()}$`, "i"),
      lastName: new RegExp(`^${lastName.trim()}$`, "i"),
      dob: dobDate,
    }).lean();

    const created = await PatientModel.create({
      firstName,
      lastName,
      mrn,
      dob: dobDate,
    });

    return res.status(201).json({
      id: created._id.toString(),
      firstName: created.firstName,
      lastName: created.lastName,
      mrn: created.mrn,
      dob: created.dob.toISOString().slice(0, 10),
      warning: existingSameIdentity
        ? {
            code: "POTENTIAL_DUPLICATE_PATIENT",
            message:
              "Patient first name + last name + DOB matches an existing patient, but MRN differs. Please verify this is not a duplicate.",
            existingPatientId: existingSameIdentity._id.toString(),
            existingMrn: existingSameIdentity.mrn,
          }
        : undefined,
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
