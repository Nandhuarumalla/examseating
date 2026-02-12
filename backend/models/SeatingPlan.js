import mongoose from "mongoose";

/**
 * Individual seat schema
 */
const SeatSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Room-wise seating schema
 */
const RoomSchema = new mongoose.Schema(
  {
    roomInfo: {
      type: String,
      required: true,
    },
    teachers: {
  invigilator1: {
    type: String,
    required: true,
  },
  invigilator2: {
    type: String,
    required: true,
  },
  attendance: {
    invigilator1: {
      type: String,
      enum: ["Present", "Absent"],
      default: "Present"
    },
    invigilator2: {
      type: String,
      enum: ["Present", "Absent"],
      default: "Present"
    }
  }
},

    /**
     * rawTable = 2D array
     * Each cell is either SeatSchema or null
     */
    rawTable: {
      type: [[mongoose.Schema.Types.Mixed]],
      required: true,
    },
  },
  { _id: false }
);

/**
 * Main Seating Plan schema
 */
const SeatingPlanSchema = new mongoose.Schema(
  {
    examDate: {
      type: String,
      required: true,
    },

    seatingPlan: {
      type: Map,
      of: RoomSchema,
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "seatingplans" }
);

export default mongoose.model("SeatingPlan", SeatingPlanSchema);