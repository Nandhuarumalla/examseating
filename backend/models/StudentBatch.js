import mongoose from "mongoose";

const studentBatchSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  

  // store exactly what the frontend sends so frontend UI shows ranges
  regularStartRoll: { type: String },
  regularEndRoll: { type: String },
  lateralStartRoll: { type: String },
  lateralEndRoll: { type: String },

  // detainedRolls stored as array of strings
  detainedRolls: [{ type: String }],

  // optionally store generated roll list server-side
  generatedRegularRolls: [{ type: String }],
  generatedLateralRolls: [{ type: String }],

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("StudentBatch", studentBatchSchema);
