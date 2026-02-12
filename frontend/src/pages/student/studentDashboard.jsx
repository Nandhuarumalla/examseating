import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [examDate, setExamDate] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [seat, setSeat] = useState(null);
  const [seatingPlan, setSeatingPlan] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const handleSearch = async () => {
    try {
      setError("");
      setSeat(null);
      setSeatingPlan(null);

      if (!examDate || !rollNo) {
        setError("Please enter Exam Date and Roll Number");
        return;
      }

      const seatRes = await axios.get(
        "http://localhost:5000/api/student/seating",
        { params: { examDate, rollNo } }
      );
      setSeat(seatRes.data.data);

      const planRes = await axios.get(
        `http://localhost:5000/api/student/seating-plan/${examDate}`
      );
      setSeatingPlan(planRes.data.seatingPlan);
    } catch (err) {
      setError(err.response?.data?.message || "No seating plan available");
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.container, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <h1 style={styles.title}>🎓 Student Dashboard</h1>
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

        {/* Search Card */}
        <div style={styles.card}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Exam Date</label>
            <input
              type="text"
              placeholder="DD-MM-YYYY"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Roll Number</label>
            <input
              type="text"
              placeholder="22FE1A0507"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              style={styles.input}
            />
          </div>

          <button onClick={handleSearch} style={styles.button}>
            🔍 Search Seating
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </div>

        {/* Seat Details */}
        {seat && (
          <div style={{ ...styles.card, borderLeft: "6px solid #2ecc71" }}>
            <h3 style={styles.subTitle}>🪑 Seating Details</h3>
            <p><b>Roll No:</b> {seat.rollNo}</p>
            <p><b>Exam Date:</b> {seat.examDate}</p>
            <p><b>Room:</b> {seat.roomInfo}</p>
            <p><b>Seat:</b> {seat.seatPosition}</p>
            <p><b>Branch:</b> {seat.branch}</p>
            <p>
              <b>Invigilators:</b> {seat.invigilators.invigilator1},{" "}
              {seat.invigilators.invigilator2}
            </p>
          </div>
        )}

        {/* Full Seating Plan */}
        {seatingPlan && (
          <div style={styles.card}>
            <h2 style={styles.subTitle}>🏫 Full Seating Plan</h2>

            {Object.entries(seatingPlan).map(([roomNo, room]) => (
              <div key={roomNo} style={{ marginBottom: "30px" }}>
                <h4 style={{ marginBottom: "10px" }}>
                  Room: {room.roomInfo}
                </h4>

                <table style={styles.table}>
                  <tbody>
                    {room.rawTable.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((seatCell, cIdx) => {
                          const isStudent =
                            seatCell &&
                            seatCell.rollNo.toUpperCase() ===
                              rollNo.toUpperCase();

                          return (
                            <td
                              key={cIdx}
                              style={{
                                ...styles.td,
                                backgroundColor: isStudent
                                  ? "#d4f7d4"
                                  : "#fff",
                                fontWeight: isStudent ? "bold" : "normal",
                                border: isStudent
                                  ? "2px solid #2ecc71"
                                  : "1px solid #ccc"
                              }}
                            >
                              {seatCell
                                ? `${seatCell.rollNo} (${seatCell.branch})`
                                : "Empty"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #f8f9fa, #eef2f3)",
    padding: "30px"
  },
  container: {
    maxWidth: "900px",
    margin: "auto"
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#2c3e50"
  },
  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    marginBottom: "30px"
  },
  subTitle: {
    marginBottom: "15px",
    color: "#34495e"
  },
  inputGroup: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px"
  },
  error: {
    color: "red",
    marginTop: "10px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  td: {
    padding: "10px",
    textAlign: "center",
    minWidth: "120px"
  }
};

export default StudentDashboard;
