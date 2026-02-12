import express from "express";
import SeatingPlan from "../models/SeatingPlan.js"; // Adjust path if needed
import { isTeacher } from "../middleware/authMiddleware.js"; // Optional auth middleware

const router = express.Router();

/**
 * GET /teacher/duties
 * Returns all invigilation duties assigned to the logged-in teacher
 */
router.get("/teacher/duties", isTeacher, async (req, res) => {
  try {
    const teacherName = req.user.name.trim(); // Remove extra spaces
    const allPlans = await SeatingPlan.find({}); // Get all seating plans

    const assignedDuties = [];

    allPlans.forEach((plan) => {
      const examDate = plan.examDate;
      const seatingPlan = plan.seatingPlan;

      // Iterate over all rooms in seatingPlan
      for (const roomKey in seatingPlan) {
        if (seatingPlan.hasOwnProperty(roomKey)) {
          const room = seatingPlan[roomKey];
          const inv1 = room.teachers.invigilator1?.trim();
          const inv2 = room.teachers.invigilator2?.trim();

          if (inv1 === teacherName || inv2 === teacherName) {
            assignedDuties.push({
              examDate,
              roomName: roomKey,
              roomInfo: room.roomInfo,
              role: inv1 === teacherName ? "Invigilator 1" : "Invigilator 2",
              attendance:
                inv1 === teacherName
                  ? room.teachers.attendance.invigilator1
                  : room.teachers.attendance.invigilator2,
            });
          }
        }
      }
    });

    if (assignedDuties.length === 0) {
      return res.status(200).json({ message: "No invigilation duties assigned" });
    }

    res.status(200).json(assignedDuties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
