import { Link } from "react-router-dom";
import { FaUserPlus, FaSignInAlt } from "react-icons/fa";

export default function Navbar() {
  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>
          Smart Seating Arrangement & Teacher Allocation System
        </h2>

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>
            <FaSignInAlt /> Login
          </Link>

          <Link to="/register" style={styles.link}>
            <FaUserPlus /> Register
          </Link>
        </div>
      </nav>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    position: "fixed",
    top: 0,
    zIndex: 1000
  },
  navbar: {
    padding: "15px 30px",
    background: "linear-gradient(to right, #4facfe, #00f2fe)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },
  logo: {
    fontSize: "18px",
    fontWeight: "bold"
  },
  links: {
    display: "flex",
    gap: "20px"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px"
  }
};
