import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  examType: String,
  examYear: Number,
  examDate: String,
  examTime: String,
  branch: String,
  subject: String,
});

export default mongoose.model("Exam", examSchema);
