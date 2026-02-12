import express from "express";
import Exam from "../models/Exam.js";
import StudentBatch from "../models/StudentBatch.js";
import Room from "../models/Room.js";
import Teacher from "../models/Teacher.js";

const router = express.Router();

router.post("/seating-csv", async (req, res) => {
  try {
    const { examDate, seatingPlan } = req.body;

    if (!seatingPlan) {
      return res.status(400).json({ message: "Seating data missing" });
    }

    let csv =
      "Exam Date,Room,Invigilator 1,Invigilator 2,Row,Column,Roll Number,Branch\n";

    for (const [roomNo, data] of Object.entries(seatingPlan)) {
      const inv1 = data.teachers.invigilator1;
      const inv2 = data.teachers.invigilator2;

      data.rawTable.forEach((row, rIdx) => {
        row.forEach((seat, cIdx) => {
          if (seat) {
            csv += `${examDate},${roomNo},${inv1},${inv2},${rIdx + 1},${cIdx + 1},${seat.rollNo},${seat.branch}\n`;
          }
        });
      });
    }

    res.header("Content-Type", "text/csv");
    res.attachment(`seating_${examDate}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export failed" });
  }
});

export default router;
