import { useState } from "react";
import { loginUser } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await loginUser(form);

    if (!res.success) return alert(res.message);

    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.role);

    if (res.role === "admin") navigate("/admin/dashboard");
    if (res.role === "teacher") navigate("/teacher/dashboard");
    if (res.role === "student") navigate("/student/dashboard");
  };

  return (
    <>
      {/* ✅ FIXED RUNNING NAVBAR */}
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Welcome Back</h2>
          <p style={styles.subText}>Login to continue</p>

          <form onSubmit={handleSubmit} style={styles.form}>

            {/* ✅ EMAIL FIELD WITH ICON */}
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

            {/* ✅ PASSWORD FIELD WITH EYE ICON */}
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

            <button type="submit" style={styles.button}>
              Login
            </button>

            {/* ✅ REGISTER REDIRECT */}
            <p style={styles.registerText}>
              Don’t have an account?{" "}
              <Link to="/register" style={styles.registerLink}>
                Register here
              </Link>
            </p>

          </form>
        </div>
      </div>
    </>
  );
}

/* ✅ STYLING */
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

  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: "5px"
  },

  subText: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#666"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  inputBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px"
  },

  icon: {
    marginRight: "8px",
    color: "#667eea"
  },

  eye: {
    cursor: "pointer",
    color: "#667eea"
  },

  input: {
    border: "none",
    outline: "none",
    flex: 1
  },

  button: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#667eea",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  },

  registerText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px"
  },

  registerLink: {
    color: "#667eea",
    fontWeight: "bold",
    textDecoration: "none"
  }
};
