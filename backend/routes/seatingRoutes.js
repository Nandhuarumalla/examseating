import express from "express";
import StudentBatch from "../models/StudentBatch.js";
import Room from "../models/Room.js";
import Teacher from "../models/Teacher.js";
import Exam from "../models/Exam.js"; // ✅ REQUIRED
import SeatingPlan from "../models/SeatingPlan.js";
const router = express.Router();

/* ---------------- ROLL GENERATION ---------------- */

function generateRollNumbers(start, end) {
  if (!start || !end) return [];
  const prefix = start.slice(0, -4);
  const startSuffix = start.slice(-4);
  const endSuffix = end.slice(-4);

  const rolls = [];
  let current = startSuffix;

  while (current <= endSuffix) {
    rolls.push(prefix + current);
    const letterPart = current.slice(0, 2);
    const numPart = parseInt(current.slice(-2)) + 1;

    if (numPart > 99) {
      const nextLetter = String.fromCharCode(letterPart.charCodeAt(0) + 1);
      current = nextLetter + "01";
    } else {
      current = letterPart + String(numPart).padStart(2, "0");
    }
  }
  return rolls;
}

/* ---------------- BRANCH PAIRS ---------------- */

const branchPairs = {
  CSE: "ECE", ECE: "CSE",
  MECH: "CSM", CSM: "MECH",
  CAI: "IT", IT: "CAI",
  EEE: "CSD", CSD: "EEE",
  CIVIL: "AIML", AIML: "CIVIL",
};

/* ---------------- HELPER FUNCTIONS ---------------- */

function extractDayFromDate(dateStr) {
  const [dd, mm, yyyy] = dateStr.split("-");
  const jsDate = new Date(`${yyyy}-${mm}-${dd}`);
  return jsDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function extractTime(examTime) {
  const [start, end] = examTime.split("-");
  return { startTime: start.trim(), endTime: end.trim() };
}

function isTeacherBusy(teacher, day, start, end) {
  return teacher.busyPeriods?.some(bp =>
    bp.day === day &&
    ((start >= bp.startTime && start < bp.endTime) ||
     (end > bp.startTime && end <= bp.endTime))
  );
}

/* ============================================ */
/* ✅ GET EXISTING SEATING PLAN BY DATE */
/* ============================================ */
router.get("/by-date/:examDate", async (req, res) => {
  try {
    const { examDate } = req.params;
    console.log("Fetching seating plan for date:", examDate);
    
    if (!examDate) {
      return res.status(400).json({ success: false, message: "Exam date required" });
    }

    const seatingPlan = await SeatingPlan.findOne({ examDate }).lean();

    if (!seatingPlan) {
      console.log("No seating plan found for:", examDate);
      // Try to fetch all dates to help debug
      const allPlans = await SeatingPlan.find({}).select("examDate").lean();
      console.log("Available dates:", allPlans.map(p => p.examDate));
      return res.status(404).json({ 
        success: false, 
        message: `No seating plan found for date ${examDate}`,
        availableDates: allPlans.map(p => p.examDate)
      });
    }

    // Convert Map to Object if necessary
    let seatingPlanData = seatingPlan.seatingPlan;
    if (seatingPlanData instanceof Map) {
      seatingPlanData = Object.fromEntries(seatingPlanData);
    }

    return res.status(200).json({
      success: true,
      seatingPlan: seatingPlanData,
      generatedAt: seatingPlan.generatedAt
    });
  } catch (error) {
    console.error("Error fetching seating plan:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching seating plan", 
      error: error.message 
    });
  }
});

/* ============================================ */
/* GENERATE NEW SEATING PLAN */
/* ============================================ */

router.post("/generate", async (req, res) => {
  try {
    const { examDate } = req.body;
    if (!examDate)
      return res.status(400).json({ success: false, message: "Exam date required" });

    const exams = await Exam.find({ examDate });
    const batches = await StudentBatch.find();
    const rooms = await Room.find();
    const teachers = await Teacher.find();

    if (!exams.length || !batches.length || !rooms.length || !teachers.length) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const day = extractDayFromDate(examDate);
    const { startTime, endTime } = extractTime(exams[0].examTime);

    const seatingPlan = {};
    let roomIndex = 0;
    const usedBranches = new Set();
    const usedTeachers = new Set();

    // ✅ COLLECT STUDENTS GROUPED BY BRANCH
    const studentsByBranch = {};
    
    for (const batch of batches) {
      const rollNumbers = [
        ...(batch.detainedRolls || []),
        ...generateRollNumbers(batch.regularStartRoll, batch.regularEndRoll),
        ...(batch.lateralStartRoll ? generateRollNumbers(batch.lateralStartRoll, batch.lateralEndRoll) : []),
      ];

      if (!studentsByBranch[batch.branch]) {
        studentsByBranch[batch.branch] = [];
      }

      rollNumbers.forEach(rollNo => {
        studentsByBranch[batch.branch].push(rollNo);
      });
    }

    console.log("Students by branch:", Object.keys(studentsByBranch).map(b => `${b}: ${studentsByBranch[b].length}`));

    // ✅ STORE BRANCH QUEUES FOR COLUMN-WISE ALLOCATION
    const branchQueues = {};
    Object.keys(studentsByBranch).forEach(branch => {
      branchQueues[branch] = [...studentsByBranch[branch]];
    });

    // Create pairs - PRIORITIZE CSE <-> ECE FIRST, then other predefined pairs
    const processedBranches = new Set();
    const branchPairsList = [];
    const allBranches = Object.keys(branchQueues).sort();

    console.log("All branches in database:", allBranches);

    // ✅ FIRST PRIORITY: CSE <-> ECE (if both exist)
    if (branchQueues["CSE"] && branchQueues["ECE"]) {
      branchPairsList.push(["CSE", "ECE"]);
      processedBranches.add("CSE");
      processedBranches.add("ECE");
      console.log("Paired (priority): CSE <-> ECE");
    }

    // ✅ SECOND: Try to match other predefined branch pairs
    for (const [branch1, branch2] of Object.entries(branchPairs)) {
      if (processedBranches.has(branch1) || processedBranches.has(branch2)) continue;
      
      if (branchQueues[branch1] && branchQueues[branch2]) {
        branchPairsList.push([branch1, branch2]);
        processedBranches.add(branch1);
        processedBranches.add(branch2);
        console.log(`Paired (predefined): ${branch1} <-> ${branch2}`);
      }
    }

    // ✅ THIRD: Pair remaining unpaired branches with each other
    const unpairedBranches = allBranches.filter(b => !processedBranches.has(b));
    for (let i = 0; i < unpairedBranches.length; i += 2) {
      const branch1 = unpairedBranches[i];
      const branch2 = unpairedBranches[i + 1];

      if (branch2) {
        branchPairsList.push([branch1, branch2]);
        processedBranches.add(branch1);
        processedBranches.add(branch2);
        console.log(`Paired (remaining): ${branch1} <-> ${branch2}`);
      } else {
        branchPairsList.push([branch1]);
        processedBranches.add(branch1);
        console.log(`Single branch: ${branch1}`);
      }
    }

    console.log("Branch pairs (final):", branchPairsList.map(p => p.join(" <-> ")));

    // ✅ NOW FILL ROOMS WITH FLEXIBLE BRANCH PAIR ALLOCATION
    const allocateStudentsToRooms = () => {
      let pairIndex = 0;

      while (pairIndex < branchPairsList.length) {
        const pair = branchPairsList[pairIndex];
        const branch1 = pair[0];
        const branch2 = pair[1] || branch1;

        // Keep filling rooms until this branch pair is completely exhausted
        while (branchQueues[branch1].length > 0 || branchQueues[branch2].length > 0) {
          if (roomIndex >= rooms.length) {
            console.warn(`Not enough rooms!`);
            return;
          }

          const room = rooms[roomIndex];
          const cols = room.columns || 8;
          const rows = Math.ceil(room.capacity / cols);

          // ✅ CREATE ROOM ONLY ONCE
          if (!seatingPlan[room.roomNumber]) {
            // ✅ ASSIGN 2 FREE TEACHERS
            let inv1 = "TBD", inv2 = "TBD";

            for (const t of teachers) {
              const tid = t._id.toString();
              if (usedTeachers.has(tid)) continue;
              if (isTeacherBusy(t, day, startTime, endTime)) continue;

              if (inv1 === "TBD") {
                inv1 = t.teacherName;
                usedTeachers.add(tid);
              } else if (inv2 === "TBD") {
                inv2 = t.teacherName;
                usedTeachers.add(tid);
                break;
              }
            }

            seatingPlan[room.roomNumber] = {
              roomInfo: `${room.blockName} - Floor ${room.floorNo || "N/A"} - Room ${room.roomNumber}`,
              capacity: room.capacity,
              teachers: { invigilator1: inv1, invigilator2: inv2 },
              rawTable: Array.from({ length: rows }, () => Array(cols).fill(null)),
            };
          }

          // ✅ FILL ROOM: First fill all ODD columns with branch1, then EVEN columns with branch2
          // Then if both are exhausted, try next pair to fill any remaining empty seats
          let roomFilled = false;
          let pairExhausted = false;

          // Step 1: Fill ODD columns (1, 3, 5, 7) with branch1
          for (let c = 0; c < cols && branchQueues[branch1].length > 0; c += 2) {
            for (let r = 0; r < rows && branchQueues[branch1].length > 0; r++) {
              if (!seatingPlan[room.roomNumber].rawTable[r][c]) {
                const rollNo = branchQueues[branch1].shift();
                seatingPlan[room.roomNumber].rawTable[r][c] = {
                  rollNo,
                  branch: branch1,
                };
              }
            }
          }

          // Step 2: Fill EVEN columns (2, 4, 6, 8) with branch2
          for (let c = 1; c < cols && branchQueues[branch2].length > 0; c += 2) {
            for (let r = 0; r < rows && branchQueues[branch2].length > 0; r++) {
              if (!seatingPlan[room.roomNumber].rawTable[r][c]) {
                const rollNo = branchQueues[branch2].shift();
                seatingPlan[room.roomNumber].rawTable[r][c] = {
                  rollNo,
                  branch: branch2,
                };
              }
            }
          }

          // Step 3: If branch1 or branch2 still has students, fill remaining empty seats
          for (let c = 0; c < cols && (branchQueues[branch1].length > 0 || branchQueues[branch2].length > 0); c++) {
            for (let r = 0; r < rows && (branchQueues[branch1].length > 0 || branchQueues[branch2].length > 0); r++) {
              if (!seatingPlan[room.roomNumber].rawTable[r][c]) {
                // Prioritize branch1, then branch2
                if (branchQueues[branch1].length > 0) {
                  const rollNo = branchQueues[branch1].shift();
                  seatingPlan[room.roomNumber].rawTable[r][c] = {
                    rollNo,
                    branch: branch1,
                  };
                } else if (branchQueues[branch2].length > 0) {
                  const rollNo = branchQueues[branch2].shift();
                  seatingPlan[room.roomNumber].rawTable[r][c] = {
                    rollNo,
                    branch: branch2,
                  };
                }
              }
            }
          }

          // Check if current pair is exhausted
          if (branchQueues[branch1].length === 0 && branchQueues[branch2].length === 0) {
            pairExhausted = true;
          }

          // Check if room is completely full
          let roomIsFull = true;
          for (let c = 0; c < cols && roomIsFull; c++) {
            for (let r = 0; r < rows; r++) {
              if (!seatingPlan[room.roomNumber].rawTable[r][c]) {
                roomIsFull = false;
                break;
              }
            }
          }

          // If room is not full and pair is exhausted, try next pair to fill remaining seats
          if (!roomIsFull && pairExhausted) {
            let nextPairIdx = pairIndex + 1;
            while (nextPairIdx < branchPairsList.length && !roomIsFull) {
              const nextPair = branchPairsList[nextPairIdx];
              const nextBranch1 = nextPair[0];
              const nextBranch2 = nextPair[1] || nextBranch1;

              // Fill remaining empty seats with next pair
              for (let c = 0; c < cols && (branchQueues[nextBranch1].length > 0 || branchQueues[nextBranch2].length > 0); c += 2) {
                for (let r = 0; r < rows && branchQueues[nextBranch1].length > 0; r++) {
                  if (!seatingPlan[room.roomNumber].rawTable[r][c]) {
                    const rollNo = branchQueues[nextBranch1].shift();
                    seatingPlan[room.roomNumber].rawTable[r][c] = {
                      rollNo,
                      branch: nextBranch1,
                    };
                  }
                }
              }

              for (let c = 1; c < cols && (branchQueues[nextBranch1].length > 0 || branchQueues[nextBranch2].length > 0); c += 2) {
                for (let r = 0; r < rows && branchQueues[nextBranch2].length > 0; r++) {
                  if (!seatingPlan[room.roomNumber].rawTable[r][c]) {
                    const rollNo = branchQueues[nextBranch2].shift();
                    seatingPlan[room.roomNumber].rawTable[r][c] = {
                      rollNo,
                      branch: nextBranch2,
                    };
                  }
                }
              }

              // Check if room is now full
              roomIsFull = true;
              for (let c = 0; c < cols && roomIsFull; c++) {
                for (let r = 0; r < rows; r++) {
                  if (!seatingPlan[room.roomNumber].rawTable[r][c]) {
                    roomIsFull = false;
                    break;
                  }
                }
              }

              if (!roomIsFull) {
                nextPairIdx++;
              } else {
                break;
              }
            }
          }

          // Move to next room if full or no pair has students
          if (roomIsFull) {
            console.log(`Room ${room.roomNumber}: Completely filled`);
            roomIndex++;
          } else if (pairExhausted && !roomIsFull) {
            // No more students from current pair, move to next room if it exists
            console.log(`Room ${room.roomNumber}: Partially filled with current pair`);
            roomIndex++;
          } else {
            break;
          }
        }

        pairIndex++;
      }
    };

    allocateStudentsToRooms();

await SeatingPlan.create({
  examDate,
  seatingPlan,
});
    res.json({ success: true, seatingPlan });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
