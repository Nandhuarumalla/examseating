import express from "express";
import StudentBatch from "../models/StudentBatch.js";
import generateRollNumbers from "../utils/generateRolls.js";

const router = express.Router();

/**
 * If you have authentication middleware, replace these placeholders:
 * e.g. import { protect, isAdmin } from "../middleware/auth.js";
 */
const protect = (req, res, next) => next();
const isAdmin = (req, res, next) => next();

/**
 * GET /api/student-batches
 * Return all batches
 */
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const batches = await StudentBatch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/student-batches/add
 * Body: { branch, year, section, regularStartRoll, regularEndRoll, lateralStartRoll, lateralEndRoll, detainedRolls: [] }
 */
router.post("/add", protect, isAdmin, async (req, res) => {
  try {
    const {
      branch,
      year,
      regularStartRoll,
      regularEndRoll,
      lateralStartRoll,
      lateralEndRoll,
      detainedRolls = []
    } = req.body;

    if (!branch || !year) {
      return res.status(400).json({ message: "branch and year required" });
    }

    // Generate lists server-side too (optional)
    const generatedRegularRolls =
      regularStartRoll && regularEndRoll
        ? generateRollNumbers(regularStartRoll, regularEndRoll)
        : [];

    const generatedLateralRolls =
      lateralStartRoll && lateralEndRoll
        ? generateRollNumbers(lateralStartRoll, lateralEndRoll)
        : [];

    const batch = new StudentBatch({
      branch,
      year,
      regularStartRoll: regularStartRoll || null,
      regularEndRoll: regularEndRoll || null,
      lateralStartRoll: lateralStartRoll || null,
      lateralEndRoll: lateralEndRoll || null,
      detainedRolls: Array.isArray(detainedRolls) ? detainedRolls : (detainedRolls || []).map(String),
      generatedRegularRolls,
      generatedLateralRolls
    });

    await batch.save();
    res.status(201).json({ message: "Batch added", data: batch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PUT /api/student-batches/:id
 * Update a batch
 */
router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    // If start/end changed, regenerate arrays
    let generatedRegularRolls = undefined;
    let generatedLateralRolls = undefined;

    if (payload.regularStartRoll && payload.regularEndRoll) {
      generatedRegularRolls = generateRollNumbers(payload.regularStartRoll, payload.regularEndRoll);
      payload.generatedRegularRolls = generatedRegularRolls;
    }
    if (payload.lateralStartRoll && payload.lateralEndRoll) {
      generatedLateralRolls = generateRollNumbers(payload.lateralStartRoll, payload.lateralEndRoll);
      payload.generatedLateralRolls = generatedLateralRolls;
    }

    if (payload.detainedRolls && !Array.isArray(payload.detainedRolls)) {
      // ensure detainedRolls array
      payload.detainedRolls = String(payload.detainedRolls).split(",").map(s => s.trim()).filter(Boolean);
    }

    const updated = await StudentBatch.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Batch not found" });
    res.json({ message: "Batch updated", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/student-batches/:id
 */
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await StudentBatch.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

