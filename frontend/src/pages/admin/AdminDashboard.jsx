import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Room from "./Room";
import StudentBatches from "./StudentBatches";
import ExamUploadForm from "./ExamUploadForm";
import ScheduleByDate from "./ScheduleByDate";
import Teacher from "./Teacher";
import SeatingPlan from "./SeatingPlan";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <div style={styles.page}>

      {/* ✅ HEADER */}
      <div style={{ ...styles.header, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>
            Smart Seating Arrangement & Teacher Allocation System
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6B7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ✅ MENU BUTTONS */}
      <div style={styles.menuContainer}>
        <button
          style={activePage === "room" ? styles.activeBtn : styles.menuBtn}
          onClick={() => setActivePage("room")}
        >
          Upload Room Details
        </button>

        <button
          style={activePage === "student" ? styles.activeBtn : styles.menuBtn}
          onClick={() => setActivePage("student")}
        >
          Upload Student Details
        </button>

        <button
          style={activePage === "exam" ? styles.activeBtn : styles.menuBtn}
          onClick={() => setActivePage("exam")}
        >
          Upload Exam Details
        </button>

        <button
          style={activePage === "schedule" ? styles.activeBtn : styles.menuBtn}
          onClick={() => setActivePage("schedule")}
        >
          View Schedule By Date
        </button>

        <button
          style={activePage === "teacher" ? styles.activeBtn : styles.menuBtn}
          onClick={() => setActivePage("teacher")}
        >
          Upload Teacher Details
        </button>

        <button
          style={activePage === "seating" ? styles.activeBtn : styles.menuBtn}
          onClick={() => setActivePage("seating")}
        >
          AI Seating Plan & Invigilation Duty
        </button>
      </div>

      {/* ✅ CONTENT BOX */}
      <div style={styles.contentBox}>
        {activePage === "room" && <Room />}
        {activePage === "student" && <StudentBatches />}
        {activePage === "exam" && <ExamUploadForm />}
        {activePage === "schedule" && <ScheduleByDate />}
        {activePage === "teacher" && <Teacher />}
        {activePage === "seating" && <SeatingPlan />}
        {activePage === "" && (
          <div style={styles.placeholder}>
            <h3>Welcome, Admin 👋</h3>
            <p>Please select an option above to continue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

/* ✅ STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #667eea, #764ba2)",
    padding: "20px"
  },

  header: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "25px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
  },

  title: {
    margin: 0,
    color: "#333"
  },

  subtitle: {
    marginTop: "5px",
    color: "#666",
    fontSize: "14px"
  },

  menuContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginBottom: "25px"
  },

  menuBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: "white",
    color: "#333",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },

  activeBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: "#4facfe",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  },

  contentBox: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    minHeight: "300px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
  },

  placeholder: {
    textAlign: "center",
    color: "#666",
    marginTop: "50px"
  }
};
