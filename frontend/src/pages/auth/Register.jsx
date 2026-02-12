import { useState } from "react";
import { registerUser } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student"
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await registerUser(form);

    if (res.success) {
      alert("Registration Successful! Please Login.");
      navigate("/login");
    } else {
      alert(res.message);
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.subText}>Join our platform</p>

          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Name */}
            <div style={styles.inputBox}>
              <FaUser style={styles.icon} />
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            {/* Email */}
            <div style={styles.inputBox}>
              <FaEnvelope style={styles.icon} />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            {/* Phone */}
            <div style={styles.inputBox}>
              <FaPhone style={styles.icon} />
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            {/* Password */}
            <div style={styles.inputBox}>
              <FaLock style={styles.icon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eye}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Role */}
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            <button type="submit" style={styles.button}>
              Register
            </button>

            <p style={styles.loginText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.loginLink}>
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #667eea, #764ba2)",
    paddingTop: "80px"
  },
  card: {
    background: "white",
    padding: "35px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  heading: { textAlign: "center", color: "#333" },
  subText: { textAlign: "center", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },

  inputBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px"
  },

  icon: { marginRight: "8px", color: "#667eea" },

  eye: { cursor: "pointer", color: "#667eea" },

  input: {
    border: "none",
    outline: "none",
    flex: 1
  },

  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  button: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#667eea",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  loginText: { textAlign: "center" },
  loginLink: { color: "#667eea", fontWeight: "bold", textDecoration: "none" }
};
