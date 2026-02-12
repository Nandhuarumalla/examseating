import express from "express";
import SeatingPlan from "../models/SeatingPlan.js";

const router = express.Router();

/* =========================================================
   🔍 SEARCH STUDENT SEAT (ROLL NO + EXAM DATE)
   URL: /api/student/seating?examDate=17-09-2025&rollNo=22FE1A0507
========================================================= */
router.get("/seating", async (req, res) => {
  try {
    const { rollNo, examDate } = req.query;

    if (!rollNo || !examDate) {
      return res.status(400).json({
        success: false,
        message: "rollNo and examDate are required",
      });
    }

    // Fetch seating plan
    const plan = await SeatingPlan.findOne({ examDate });

    if (!plan || !plan.seatingPlan) {
      return res.status(404).json({
        success: false,
        message: "Seating plan not found for this exam date",
      });
    }

    // seatingPlan is a MAP → convert to iterable
    for (const [roomKey, room] of plan.seatingPlan.entries()) {

      if (!room?.rawTable || !Array.isArray(room.rawTable)) continue;

      for (let r = 0; r < room.rawTable.length; r++) {

        if (!Array.isArray(room.rawTable[r])) continue;

        for (let c = 0; c < room.rawTable[r].length; c++) {
          const seat = room.rawTable[r][c];

          if (
            seat &&
            seat.rollNo &&
            seat.rollNo.trim().toUpperCase() ===
              rollNo.trim().toUpperCase()
          ) {
            return res.json({
              success: true,
              data: {
                rollNo: seat.rollNo,
                examDate,
                roomNo: roomKey,
                roomInfo: room.roomInfo,
                seatPosition: `Row ${r + 1}, Column ${c + 1}`,
                branch: seat.branch,
                invigilators: room.teachers,
              },
            });
          }
        }
      }
    }

    return res.status(404).json({
      success: false,
      message: "Roll number not found in this exam",
    });

  } catch (error) {
    console.error("Student Seating Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================================================
   🪑 FULL SEATING PLAN (BY EXAM DATE)
   URL: /api/student/seating-plan/17-09-2025
========================================================= */
router.get("/seating-plan/:examDate", async (req, res) => {
  try {
    const { examDate } = req.params;

    const plan = await SeatingPlan.findOne({ examDate });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Seating plan not found",
      });
    }

    res.json({
      success: true,
      seatingPlan: Object.fromEntries(plan.seatingPlan),
    });

  } catch (error) {
    console.error("Full Seating Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
