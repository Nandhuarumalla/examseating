import { useState } from "react";

function ExamUploadForm() {
  const [examType, setExamType] = useState("");
  const [examYear, setExamYear] = useState("");
  const [examTime, setExamTime] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("examType", examType);
    formData.append("examYear", examYear);
    formData.append("examTime", examTime);
    formData.append("csvFile", csvFile);

    try {
      const res = await fetch("http://localhost:5000/api/exams/upload-csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.text();

      if (res.ok) alert("✅ Upload Successful!");
      else alert(`❌ Upload Failed! ${res.status}: ${data}`);
    } catch (err) {
      alert("❌ Upload Failed! " + err.message);
    } finally {
      setLoading(false);
      setExamType("");
      setExamYear("");
      setExamTime("");
      setCsvFile(null);
    }
  };

  return (
    <>
      <style>{animationStyles}</style>

      <div style={page}>
        <div style={card} className="animated-card">
          <h2 style={title}>📤 Upload Exam Details</h2>

          <form onSubmit={handleSubmit} style={form}>
            <input
              style={input}
              placeholder="📘 Exam Type"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              required
            />

            <input
              style={input}
              placeholder="📅 Exam Year"
              value={examYear}
              onChange={(e) => setExamYear(e.target.value)}
              required
            />

            <input
              style={input}
              placeholder="⏰ Exam Time"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
              required
            />

            <label style={fileBox}>
              📄 Choose CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => setCsvFile(e.target.files[0])}
                required
              />
            </label>

            <button
              type="submit"
              style={loading ? disabledBtn : uploadBtn}
              className="animated-btn"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ✅ ANIMATIONS */
const animationStyles = `
.animated-card {
  animation: fadeIn 0.8s ease-in-out;
}

.animated-btn:hover {
  transform: scale(1.07);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

/* ✅ STYLES */
const page = {
  minHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(to right, #4f46e5, #2563eb)",
};

const card = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(12px)",
  padding: "30px",
  width: "100%",
  maxWidth: "450px",
  borderRadius: "15px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  color: "white",
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  fontSize: "15px",
};

const fileBox = {
  background: "white",
  color: "#333",
  textAlign: "center",
  padding: "12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const uploadBtn = {
  background: "#22c55e",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

const disabledBtn = {
  ...uploadBtn,
  background: "gray",
  cursor: "not-allowed",
};

export default ExamUploadForm;
