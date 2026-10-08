import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTokens } from "../App";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  const tk = useTokens();

  if (loading && !user) {
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

  if (!user) return <Navigate to="/auth" replace />;

  // Keep the protected page mounted while the persisted Supabase session
  // is being revalidated after a browser tab is restored.
  if (loading) return children;

  if (!profile?.approved) return <Navigate to="/waitlist" replace />;

  if (adminOnly && profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}