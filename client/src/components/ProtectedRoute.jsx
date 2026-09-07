import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTokens } from "../App";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const tk = useTokens();

  const [checkingApproval, setCheckingApproval] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifyAccess = async () => {
      if (!user) {
        if (!cancelled) setCheckingApproval(false);
        return;
      }

      try {
        // Get the latest approved/role status from Supabase
        if (refreshProfile) {
          await refreshProfile();
        }
      } catch (err) {
        console.error("Failed to refresh profile:", err);
      } finally {
        if (!cancelled) {
          setCheckingApproval(false);
        }
      }
    };

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [user, refreshProfile]);

  if (loading || (user && checkingApproval)) {
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
        Verifying access…
      </div>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/auth" replace />;

  // Logged in but access revoked / not approved
  if (!profile?.approved) {
    return <Navigate to="/waitlist" replace />;
  }

  // Admin-only route
  if (adminOnly && profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}