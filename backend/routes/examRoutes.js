import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import Exam from "../models/Exam.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Upload CSV
router.post("/upload-csv", upload.single("csvFile"), async (req, res) => {
  const { examType, examYear, examTime } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const results = [];

  try {
    fs.createReadStream(req.file.path)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(), // clean headers
          skipLines: 0,
        })
      )
      .on("data", (row) => {
        const branch = row["Branch"]?.trim();
        if (!branch) return;

        Object.keys(row).forEach((key) => {
          if (key !== "Branch" && row[key] && row[key].trim() !== "") {
            results.push({
              examType: examType || "Unknown",
              examYear: examYear ? Number(examYear) : new Date().getFullYear(),
              examTime: examTime || "TBD",
              // FIXED
              examDate: key.trim(),
              branch: branch,
              subject: row[key].trim(),
            });
          }
        });
      })
      .on("end", async () => {
        if (results.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "No valid rows found" });
        }

        await Exam.insertMany(results);
        fs.unlinkSync(req.file.path);

        res.json({
          message: "CSV Uploaded & Processed Successfully",
          inserted: results.length,
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "CSV parsing error", error: err.message });
      });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get All Unique Dates
router.get("/dates", async (req, res) => {
  try {
    const dates = await Exam.distinct("examDate");
    res.json(dates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get Schedule by Date
router.get("/schedule/:date", async (req, res) => {
  try {
    const schedule = await Exam.find({ examDate: req.params.date })
      .select("branch subject -_id")
      .sort({ branch: 1 });

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
