import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowed }) {
  const role = localStorage.getItem("role");

  if (!role) return <Navigate to="/login" />;
  if (!allowed.includes(role)) return <Navigate to="/login" />;

  return children;
}
