// models/Teacher.js

import mongoose from "mongoose";

const busyPeriodSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    trim: true,
    // example: "3"
  },
  branch: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    // example: "CSE"
  },
  section: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    // example: "A"
  },
  day: {
    type: String,
    required: true,
    enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
  },
  startTime: {
    type: String,
    required: true,
    trim: true,
    // example: "11:40"
  },
  endTime: {
    type: String,
    required: true,
    trim: true,
    // example: "12:30"
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: false, // we don't need sub-document IDs
});

const teacherSchema = new mongoose.Schema({
  teacherName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  subjects: {
    type: [String],
    default: [],
  },
  // This is now the ONLY place we store schedule data
  busyPeriods: [busyPeriodSchema],
}, {
  timestamps: true,
});

// Indexes for fast queries
teacherSchema.index({ "busyPeriods.year": 1, "busyPeriods.branch": 1, "busyPeriods.section": 1 });
teacherSchema.index({ "busyPeriods.day": 1, "busyPeriods.startTime": 1, "busyPeriods.endTime": 1 });

export default mongoose.model("Teacher", teacherSchema);
