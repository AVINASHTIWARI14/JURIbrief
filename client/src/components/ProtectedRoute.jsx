import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTokens } from "../App";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  const tk = useTokens();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tk.textMuted,
          fontFamily: "'Roboto Serif', Georgia, serif",
          fontSize: "1.1rem",
          fontStyle: "italic",
        }}
      >
        Verifying session…
      </div>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/auth" replace />;

  // Logged in but not yet approved — send to waitlist page
  if (!profile?.approved) return <Navigate to="/waitlist" replace />;

  // Admin-only route: non-admins are redirected to dashboard
  if (adminOnly && profile?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}
