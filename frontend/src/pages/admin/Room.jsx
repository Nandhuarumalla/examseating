import React, { useState, useEffect } from "react";
import axios from "axios";

const Room = () => {
  const [form, setForm] = useState({
    blockName: "",
    floorNo: "",
    roomNumber: "",
    rows: "",
    columns: "",
  });

  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/rooms");
      setRooms(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        rows: Number(form.rows),
        columns: Number(form.columns),
        floorNo: Number(form.floorNo),
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/rooms/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/api/admin/rooms", payload);
      }

      setForm({ blockName: "", floorNo: "", roomNumber: "", rows: "", columns: "" });
      fetchRooms();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (room) => {
    setForm({
      blockName: room.blockName,
      floorNo: room.floorNo,
      roomNumber: room.roomNumber,
      rows: room.rows,
      columns: room.columns,
    });
    setEditingId(room._id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ blockName: "", floorNo: "", roomNumber: "", rows: "", columns: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this room?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        console.log(err);
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <div style={styles.container}>

      {/* ✅ FORM CARD */}
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {editingId ? "Edit Room" : "Add Room"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="blockName" placeholder="Block Name" value={form.blockName} onChange={handleChange} required />
          <input style={styles.input} name="floorNo" type="number" placeholder="Floor No" value={form.floorNo} onChange={handleChange} required />
          <input style={styles.input} name="roomNumber" placeholder="Room Number" value={form.roomNumber} onChange={handleChange} required />
          <input style={styles.input} name="rows" type="number" placeholder="Number of Rows" value={form.rows} onChange={handleChange} required />
          <input style={styles.input} name="columns" type="number" placeholder="Number of Columns" value={form.columns} onChange={handleChange} required />

          <div style={styles.btnGroup}>
            <button type="submit" style={styles.primaryBtn}>
              {editingId ? "Update Room" : "Add Room"}
            </button>

            {editingId && (
              <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ✅ TABLE CARD */}
      <div style={styles.card}>
        <h3 style={styles.heading}>All Rooms</h3>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th>Block</th>
                <th>Floor</th>
                <th>Room No</th>
                <th>Rows</th>
                <th>Columns</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} style={styles.tableRow}>
                  <td>{room.blockName}</td>
                  <td>{room.floorNo}</td>
                  <td>{room.roomNumber}</td>
                  <td>{room.rows}</td>
                  <td>{room.columns}</td>
                  <td>{room.capacity}</td>
                  <td>
                    <button style={styles.editBtn} onClick={() => handleEdit(room)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(room._id)}>Delete</button>
                  </td>
                </tr>
              ))}

              {rooms.length === 0 && (
                <tr>
                  <td colSpan="7" style={styles.empty}>No rooms added yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Room;

/* ✅ STYLES */
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.15)"
  },

  heading: {
    marginBottom: "15px",
    color: "#333"
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px"
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  btnGroup: {
    gridColumn: "span 2",
    display: "flex",
    gap: "10px",
    marginTop: "10px"
  },

  primaryBtn: {
    background: "#4facfe",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  cancelBtn: {
    background: "#aaa",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  tableWrapper: {
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  tableHead: {
    background: "#4facfe",
    color: "white"
  },

  tableRow: {
    textAlign: "center"
  },

  editBtn: {
    background: "#ffc107",
    border: "none",
    padding: "6px 10px",
    marginRight: "6px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  deleteBtn: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#777"
  }
};
