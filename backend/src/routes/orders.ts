import { Router } from "express";
import mongoose from "mongoose";
import { createOrderSchema } from "../validators/order";
import { OrderModel, normalize } from "../models/Order";
import { PatientModel } from "../models/Patient";
import { ProviderModel } from "../models/Provider";
import { getDuplicateField, isMongoDuplicateKeyError } from "../lib/httpErrors";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
const pdfParse = require("pdf-parse");

export const ordersRouter = Router();

ordersRouter.post("/", upload.single("patientRecordsFile"), async (req, res) => {
  // Helper: parse newline text into string[]
  const parseLines = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof v === "string") {
      return v
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  // 1) Build patientRecordsText (textarea OR file extraction)
  let patientRecordsText = typeof req.body.patientRecordsText === "string" ? req.body.patientRecordsText : "";

  try {
    if (req.file) {
      const original = req.file.originalname.toLowerCase();
      const mimetype = req.file.mimetype;

      if (mimetype === "text/plain" || original.endsWith(".txt")) {
        patientRecordsText = req.file.buffer.toString("utf-8");
      } else if (mimetype === "application/pdf" || original.endsWith(".pdf")) {
          try {
              console.log("PDF upload detected");
              console.log("PDF file size (bytes):", req.file.buffer.length);

              const { CanvasFactory } = require("pdf-parse/worker");
              const { PDFParse } = require("pdf-parse");

              const parser = new PDFParse({
                data: req.file.buffer,
                CanvasFactory,
              });

              const parsedPdf = await parser.getText();

              patientRecordsText = (parsedPdf.text ?? "").trim();

              await parser.destroy();

              patientRecordsText = (parsedPdf.text ?? "").trim();

              console.log("PDF parsed successfully");
              console.log("Extracted text length:", (parsedPdf.text ?? "").length);

              if (!patientRecordsText) {
                  return res.status(400).json({
                      error: "Invalid input",
                      message: "PDF has no extractable text (may be scanned). Please upload a .txt file or paste the text.",
                  });
              }
          } catch (e) {
              return res.status(400).json({
                  error: "Invalid input",
                  message: "Failed to parse PDF. Please upload a .txt file or paste records as text.",
              });
          }
      } else {
        return res.status(400).json({
          error: "Invalid input",
          message: "Unsupported file type. Upload a .txt or .pdf file.",
        });
      }

      if (!patientRecordsText.trim()) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Could not extract any text from the uploaded file.",
        });
      }
    }

    // 2) Build a payload that matches createOrderSchema
    // Note: multipart form fields arrive as strings
    const payload = {
      patientId: req.body.patientId,
      providerId: req.body.providerId,
      medicationName: req.body.medicationName,
      primaryDiagnosis: req.body.primaryDiagnosis,
      additionalDiagnoses: parseLines(req.body.additionalDiagnoses),
      medicationHistory: parseLines(req.body.medicationHistory),
      patientRecordsText,
    };

    // 3) Validate with your existing schema
    const parsed = createOrderSchema.safeParse(payload);
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
      patientRecordsText: recordsTextValidated,
    } = parsed.data;

    // Validate object ids early
    if (!mongoose.isValidObjectId(patientId) || !mongoose.isValidObjectId(providerId)) {
      return res.status(400).json({ error: "Invalid input", message: "Invalid patientId/providerId" });
    }

    // Ensure referenced entities exist
    const [patient, provider] = await Promise.all([
      PatientModel.findById(patientId).lean(),
      ProviderModel.findById(providerId).lean(),
    ]);

    if (!patient) return res.status(404).json({ error: "Not found", message: "Patient not found" });
    if (!provider) return res.status(404).json({ error: "Not found", message: "Provider not found" });

    // 4) Create order (keep your duplicate protection + normalized fields)
    const created = await OrderModel.create({
      patientId,
      providerId,
      medicationName,
      medicationNameNorm: normalize(medicationName),
      primaryDiagnosis,
      primaryDiagnosisNorm: normalize(primaryDiagnosis),
      additionalDiagnoses,
      medicationHistory,
      patientRecordsText: recordsTextValidated,
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
        message: "This order looks like a duplicate for the same patient, medication, and diagnosis.",
        field,
      });
    }
    return res.status(500).json({ error: "Server error", message: "Something went wrong." });
  }
});

