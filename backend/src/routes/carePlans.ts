import { Router } from "express";
import mongoose from "mongoose";
import { CarePlanModel } from "../models/CarePlan";
import { generateCarePlanText } from "../services/carePlanService";
import { isMongoDuplicateKeyError } from "../lib/httpErrors";

export const carePlansRouter = Router();

// Generate (idempotent-ish): if exists, return existing; else create.
carePlansRouter.post("/orders/:orderId/care-plan", async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({ error: "Invalid input", message: "Invalid orderId" });
  }

  // If already generated, return it (fast path)
  const existing = await CarePlanModel.findOne({ orderId }).lean();
  if (existing) {
    return res.status(200).json({
      id: existing._id.toString(),
      orderId: existing.orderId.toString(),
      generator: existing.generator,
      promptVersion: existing.promptVersion,
    });
  }

  const result = await generateCarePlanText(orderId);
  if (result.kind === "not_found") return res.status(404).json({ error: "Not found", message: "Order not found" });
  if (result.kind === "inconsistent") return res.status(409).json({ error: "Inconsistent state", message: "Order references missing patient/provider" });

  try {
    const created = await CarePlanModel.create({
      orderId,
      planText: result.planText,
      generator: result.generator,
      promptVersion: result.promptVersion,
    });

    return res.status(201).json({
      id: created._id.toString(),
      orderId: created.orderId.toString(),
      generator: created.generator,
      promptVersion: created.promptVersion,
    });
  } catch (err) {
    // If two requests race, unique(orderId) might collide—return existing safely.
    if (isMongoDuplicateKeyError(err)) {
      const again = await CarePlanModel.findOne({ orderId }).lean();
      if (again) {
        return res.status(200).json({
          id: again._id.toString(),
          orderId: again.orderId.toString(),
          generator: again.generator,
          promptVersion: again.promptVersion,
        });
      }
    }
    return res.status(500).json({ error: "Server error", message: "Something went wrong." });
  }
});

// Download as .txt
carePlansRouter.get("/orders/:orderId/care-plan/download", async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({ error: "Invalid input", message: "Invalid orderId" });
  }

  const plan = await CarePlanModel.findOne({ orderId }).lean();
  if (!plan) return res.status(404).json({ error: "Not found", message: "Care plan not found" });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="care-plan-${orderId}.txt"`);
  return res.status(200).send(plan.planText);
});
