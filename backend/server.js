import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentBatchesRoute from "./routes/studentBatches.js";
import examRoutes from "./routes/examRoutes.js";
import TeacherRoutes from "./routes/teacherRoutes.js";
import SeatingPlan from "./routes/seatingRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import studentSeatingRoutes from "./routes/studentSeatingRoutes.js";
//import teacherSeatingRoutes from "./routes/teacherSeatingRoutes.js";



dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
connectDB();

const app = express();
app.use(cors());
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student-batches", studentBatchesRoute);
app.use("/api/exams", examRoutes);
app.use("/api/teachers", TeacherRoutes);
app.use("/api/seating", SeatingPlan);
app.use("/api/export", exportRoutes);
app.use("/api/student", studentSeatingRoutes);
//app.use("/api/teacher-seating", teacherSeatingRoutes);
app.listen(5000, () => console.log("Server running on port 5000"));
