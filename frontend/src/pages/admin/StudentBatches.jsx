import { useState, useEffect } from "react";
import {
  getBatches,
  addBatch,
  updateBatch,
  deleteBatch,
} from "../../services/studentBatchService";

function StudentBatches() {
  const [form, setForm] = useState({
    branch: "",
    year: "",
    regularStartRoll: "",
    regularEndRoll: "",
    lateralStartRoll: "",
    lateralEndRoll: "",
    detainedRolls: "",
  });

  const [batches, setBatches] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await getBatches();
      setBatches(res.data);
    } catch (err) {
      console.error("Load batches error:", err);
    }
  };

  // ✅ PROGRESS CALCULATION
  const filledFields = Object.values(form).filter((v) => v !== "").length;
  const totalFields = Object.keys(form).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        year: Number(form.year),
        detainedRolls: form.detainedRolls
          ? form.detainedRolls.split(",").map((x) => x.trim())
          : [],
      };

      if (editing) {
        await updateBatch(editing._id, payload);
        setEditing(null);
      } else {
        await addBatch(payload);
      }

      setForm({
        branch: "",
        year: "",
        regularStartRoll: "",
        regularEndRoll: "",
        lateralStartRoll: "",
        lateralEndRoll: "",
        detainedRolls: "",
      });

      await loadBatches();
      alert("✅ Batch saved successfully!");
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
      alert("❌ Failed to save batch.");
    }
  };

  const handleEdit = (batch) => {
    setEditing(batch);
    setForm({
      ...batch,
      detainedRolls: batch.detainedRolls.join(", "),
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this batch?")) {
      try {
        await deleteBatch(id);
        loadBatches();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to right, #6366f1, #2563eb)", padding: "40px" }}>
      
      {/* ✅ HEADER */}
      <h1 style={{
        color: "white",
        textAlign: "center",
        marginBottom: "30px",
        fontSize: "32px",
        fontWeight: "bold",
      }}>
        🎓 Student Batch Management
      </h1>

      {/* ✅ FORM CARD */}
      <div style={card}>
        <h2 style={{ textAlign: "center" }}>
          {editing ? "✏️ Edit Batch" : "➕ Add Student Batch"}
        </h2>

        

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <input style={input} placeholder="Branch" required value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })} />

          <input style={input} placeholder="Year" type="number" required value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })} />

          <input style={input} placeholder="Regular Start Roll" required value={form.regularStartRoll}
            onChange={(e) => setForm({ ...form, regularStartRoll: e.target.value })} />

          <input style={input} placeholder="Regular End Roll" required value={form.regularEndRoll}
            onChange={(e) => setForm({ ...form, regularEndRoll: e.target.value })} />

          <input style={input} placeholder="Lateral Start Roll" value={form.lateralStartRoll}
            onChange={(e) => setForm({ ...form, lateralStartRoll: e.target.value })} />

          <input style={input} placeholder="Lateral End Roll" value={form.lateralEndRoll}
            onChange={(e) => setForm({ ...form, lateralEndRoll: e.target.value })} />

          <input style={{ ...input, gridColumn: "span 2" }}
            placeholder="Detained Rolls (comma separated)" value={form.detainedRolls}
            onChange={(e) => setForm({ ...form, detainedRolls: e.target.value })} />

          <button type="submit" style={mainBtn}>
            {editing ? "Update Batch" : "Add Batch"}
          </button>
        </form>
      </div>

      {/* ✅ TABLE CARD */}
      <div style={card}>
        <h2>📋 Existing Batches</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#e5e7eb" }}>
            <tr>
              <th style={th}>Branch</th>
              <th style={th}>Year</th>
              <th style={th}>Regular</th>
              <th style={th}>Lateral</th>
              <th style={th}>Re-join</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {batches.map((batch) => (
              <tr key={batch._id}>
                <td style={td}>{batch.branch}</td>
                <td style={td}>{batch.year}</td>
                <td style={td}>{batch.regularStartRoll} - {batch.regularEndRoll}</td>
                <td style={td}>{batch.lateralStartRoll || "—"}</td>
                <td style={td}>{batch.detainedRolls.join(", ") || "None"}</td>
                <td style={td}>
                  <button onClick={() => handleEdit(batch)} style={editBtn}>Edit</button>
                  <button onClick={() => handleDelete(batch._id)} style={deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ✅ STYLES */
const card = {
  background: "white",
  padding: "25px",
  margin: "20px auto",
  width: "90%",
  maxWidth: "950px",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const th = { padding: "10px", border: "1px solid #ccc" };
const td = { padding: "10px", border: "1px solid #ccc" };

const mainBtn = {
  gridColumn: "span 2",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
};

const editBtn = {
  background: "#facc15",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  marginRight: "5px",
};

const deleteBtn = {
  background: "#dc2626",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  color: "white",
};

export default StudentBatches;
