// routes/teacherRoutes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import Teacher from "../models/Teacher.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
// ✅ GET ALL TEACHERS (REQUIRED FOR FRONTEND)
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teachers", error: err.message });
  }
});


router.post("/upload", upload.single("csvFile"), async (req, res) => {
  // Sanitize input
  const cleanYear = (req.body.year || "").trim();
  const cleanBranch = (req.body.branch || "").trim().toUpperCase();
  const cleanSection = (req.body.section || "").trim().toUpperCase();

  if (!req.file || !cleanYear || !cleanBranch || !cleanSection) {
    try { if (req.file) await fs.promises.unlink(req.file.path); } catch {}
    return res.status(400).json({ message: "Please provide CSV file + Year + Branch + Section" });
  }

  const path = req.file.path;

  try {
    const raw = await fs.promises.readFile(path, "utf8");
    const allLines = raw.split(/\r?\n/).map(l => l.replace(/\r/g,''));
    const nonEmpty = allLines.filter(line => line && line.replace(/,/g, "").trim().length > 0);

    if (nonEmpty.length < 3) {
      await fs.promises.unlink(path);
      return res.status(400).json({ message: "CSV too short or malformed" });
    }

    const first = nonEmpty[0].split(",").map(s => s.trim());
    const second = nonEmpty[1].split(",").map(s => s.trim());
    const startTimes = first.slice(1, 9);
    const endTimes = second.slice(1, 9);

    const periodRanges = startTimes.map((start, i) => ({
      start: start || "",
      end: endTimes[i] || ""
    }));

    const monLineIndex = nonEmpty.findIndex(line => {
      const firstCell = (line.split(",")[0] || "").trim().toUpperCase();
      return firstCell === "MON";
    });

    if (monLineIndex === -1) {
      await fs.promises.unlink(path);
      return res.status(400).json({ message: "Timetable not found (MON row missing)" });
    }

    const timetableRows = nonEmpty.slice(monLineIndex, monLineIndex + 6);

    // Build subject -> teacher mapping
    const subjectToTeacher = {};
    for (let i = monLineIndex + 6; i < nonEmpty.length; i++) {
      const parts = nonEmpty[i].split(",").map(p => p.trim());
      const subject = (parts[0] || "").trim();
      const teacherName = (parts[1] || "").trim();
      if (subject && teacherName) {
        subjectToTeacher[subject.toUpperCase()] = teacherName;
      }
    }

    // fallback bottom-up scan if mapping empty
    if (Object.keys(subjectToTeacher).length === 0) {
      for (let i = nonEmpty.length - 1; i >= 0; i--) {
        const parts = nonEmpty[i].split(",").map(p => p.trim());
        const subject = (parts[0] || "").trim();
        const teacherName = (parts[1] || "").trim();
        if (subject && teacherName) {
          subjectToTeacher[subject.toUpperCase()] = teacherName;
        }
      }
    }

    if (Object.keys(subjectToTeacher).length === 0) {
      await fs.promises.unlink(path);
      return res.status(400).json({ message: "No teacher names found in CSV" });
    }

    // Load existing teachers
    const existingTeachers = await Teacher.find();
    const teacherMap = {};
    existingTeachers.forEach(t => {
      teacherMap[t.teacherName] = {
        teacherName: t.teacherName,
        subjects: new Set(Array.isArray(t.subjects) ? t.subjects : []),
        busyPeriods: Array.isArray(t.busyPeriods) ? t.busyPeriods.slice() : []
      };
    });

    let periodsAdded = 0;

    // Process timetable rows (MON..SAT)
    for (const row of timetableRows) {
      const cols = row.split(",").map(c => c.trim());
      const day = (cols[0] || "").toUpperCase();
      if (!DAYS.includes(day)) continue;

      const subjects = [];
      for (let i = 1; i <= 8; i++) {
        subjects.push((cols[i] || "").trim());
      }

      subjects.forEach((subjectRaw, idx) => {
        const subject = (subjectRaw || "").trim();
        if (!subject) return;
        const su = subject.toUpperCase();
        if (["LUNCH", "BREAK", "—", "-"].includes(su)) return;

        let teacherName = subjectToTeacher[su];
        if (!teacherName) {
          if (su.includes("DLT") && subjectToTeacher["DLT LAB"]) teacherName = subjectToTeacher["DLT LAB"];
          else if (su.includes("LAB") && subjectToTeacher[su.replace(/\s*LAB\s*$/,'') + " LAB"]) teacherName = subjectToTeacher[su.replace(/\s*LAB\s*$/,'') + " LAB"];
          else {
            const foundKey = Object.keys(subjectToTeacher).find(k => k === su || k.includes(su) || su.includes(k));
            if (foundKey) teacherName = subjectToTeacher[foundKey];
          }
        }

        if (!teacherName) {
          console.warn("Unknown subject skipped:", subject);
          return;
        }

        if (!teacherMap[teacherName]) {
          teacherMap[teacherName] = {
            teacherName,
            subjects: new Set(),
            busyPeriods: []
          };
        }

        const teacher = teacherMap[teacherName];
        teacher.subjects.add(subject);

        const startTime = periodRanges[idx]?.start || "";
        const endTime = periodRanges[idx]?.end || "";

        const exists = teacher.busyPeriods.some(p =>
          p.year === cleanYear &&
          p.branch === cleanBranch &&
          p.section === cleanSection &&
          p.day === day &&
          p.startTime === startTime &&
          p.endTime === endTime
        );

        if (!exists) {
          teacher.busyPeriods.push({
            year: cleanYear,
            branch: cleanBranch,
            section: cleanSection,
            day,
            startTime,
            endTime,
            subject
          });
          periodsAdded++;
        }
      });
    }

    // Upsert teachers
    const saveOps = Object.values(teacherMap).map(t =>
      Teacher.findOneAndUpdate(
        { teacherName: t.teacherName },
        {
          teacherName: t.teacherName,
          subjects: Array.from(t.subjects),
          busyPeriods: t.busyPeriods
        },
        { upsert: true, new: true }
      )
    );
    await Promise.all(saveOps);

    await fs.promises.unlink(path);

    return res.json({
      success: true,
      message: `${cleanYear} ${cleanBranch}-${cleanSection} timetable uploaded & merged!`,
      periodsAdded,
      totalTeachers: Object.keys(teacherMap).length
    });

  } catch (err) {
    console.error("Upload error:", err);
    try { await fs.promises.unlink(path); } catch {}
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
