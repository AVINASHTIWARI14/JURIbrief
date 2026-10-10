import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "../App";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import { supabase } from "../lib/supabase";

const API = "/api";

export default function Admin() {
  const tk = useTokens();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const [waitlist, setWaitlist] = useState([]);
  const [users, setUsers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const approvedEntries = waitlist.filter((e) => e.status === "approved");
  const pendingEntries = waitlist.filter(
    (e) => e.status !== "approved" && e.status !== "rejected"
  );
  const newContactMessages = contactMessages.filter((m) => m.status === "new");

  const muted = {
    color: tk.textMuted,
    fontFamily: "'Roboto Serif', Georgia, serif",
    fontSize: "1rem",
  };

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (profile && profile.role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const loadData = async () => {
    setDataLoading(true);
    setLoadError("");
    try {
      const authHeaders = await getAuthHeaders();
      const [waitlistRes, usersRes, contactRes] = await Promise.allSettled([
        fetch(`${API}/waitlist`, { headers: authHeaders }).then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Unable to load waitlist");
          return d;
        }),
        fetch(`${API}/users`, { headers: authHeaders }).then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Unable to load users");
          return d;
        }),
        fetch(`${API}/contact-messages`, { headers: authHeaders }).then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Unable to load contact messages");
          return d;
        }),
      ]);

      setWaitlist(
        waitlistRes.status === "fulfilled" && Array.isArray(waitlistRes.value.data)
          ? waitlistRes.value.data
          : []
      );
      setUsers(
        usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)
          ? usersRes.value.data
          : []
      );
      setContactMessages(
        contactRes.status === "fulfilled" && Array.isArray(contactRes.value.data)
          ? contactRes.value.data
          : []
      );

      if (
        waitlistRes.status === "rejected" ||
        usersRes.status === "rejected" ||
        contactRes.status === "rejected"
      ) {
        setLoadError("Some data could not be loaded. Check that the backend is running.");
      }
    } catch {
      setLoadError("Unable to load admin data right now.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === "admin") loadData();
  }, [user, profile]);

  const updateWaitlistStatus = async (id, status) => {
    setUpdatingId(id);
    setActionMessage("");
    setActionError("");
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API}/waitlist/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to update status");
      setWaitlist((curr) =>
        curr.map((e) => (String(e.id) === String(id) ? data.data : e))
      );
      setActionMessage(
        `Entry ${status === "approved" ? "approved" : "rejected"} successfully.`
      );
      await loadData();
    } catch (err) {
      setActionError(err.message || "Unable to update this entry right now.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusPill = (status) => {
    if (status === "approved") {
      return {
        bg: "rgba(61,168,122,0.14)",
        border: "rgba(61,168,122,0.35)",
        color: "#3da87a",
        label: "Approved",
      };
    }
    if (status === "rejected") {
      return {
        bg: "rgba(224,82,82,0.12)",
        border: "rgba(224,82,82,0.35)",
        color: "#e05252",
        label: "Rejected",
      };
    }
    return {
      bg: tk.goldLight,
      border: tk.goldBorder,
      color: tk.gold,
      label: "Pending",
    };
  };

  const statCard = {
    background: tk.surface,
    border: `1px solid ${tk.goldBorder}`,
    borderRadius: "22px",
    padding: "1.25rem 1.35rem",
    boxShadow: tk.isDark
      ? "0 24px 60px rgba(0,0,0,0.35)"
      : "0 18px 50px rgba(31,24,8,0.08)",
  };
  const cardStyle = { ...statCard, padding: "1.5rem" };

  const updateContactStatus = async (id, status) => {
    setUpdatingId(`contact-${id}`);
    setActionMessage("");
    setActionError("");
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API}/contact-messages/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to update message");
      setContactMessages((curr) =>
        curr.map((m) => (String(m.id) === String(id) ? data.data : m))
      );
      setActionMessage(status === "read" ? "Message marked as read." : "Message marked as new.");
    } catch (err) {
      setActionError(err.message || "Unable to update this message.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !profile) {
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
        Verifying access...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "5rem 1.5rem 3rem",
        color: tk.textPrimary,
      }}
    >
      <div
        style={{
          ...cardStyle,
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "2.1rem",
              margin: "0 0 0.4rem",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ ...muted, margin: 0 }}>
            Track registered members, review user messages, and manage platform access.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderRadius: "16px",
            background: tk.goldLight,
            border: `1px solid ${tk.goldBorder}`,
          }}
        >
          <BrandLogo size="small" />
          <p style={{ ...muted, margin: 0 }}>
            Logged in as{" "}
            <strong style={{ color: tk.gold }}>{profile.full_name || user.email}</strong>
          </p>
        </div>
      </div>

      {loadError && (
        <div
          style={{
            ...cardStyle,
            marginBottom: "1.5rem",
            border: "1px solid rgba(224,82,82,0.35)",
            background: tk.isDark
              ? "rgba(224,82,82,0.1)"
              : "rgba(224,82,82,0.08)",
          }}
        >
          <p style={{ ...muted, margin: 0, color: "#e05252" }}>{loadError}</p>
        </div>
      )}
      {actionError && (
        <div
          style={{
            ...cardStyle,
            marginBottom: "1.5rem",
            border: "1px solid rgba(224,82,82,0.35)",
            background: tk.isDark
              ? "rgba(224,82,82,0.1)"
              : "rgba(224,82,82,0.08)",
          }}
        >
          <p style={{ ...muted, margin: 0, color: "#e05252" }}>{actionError}</p>
        </div>
      )}
      {actionMessage && !actionError && (
        <div
          style={{
            ...cardStyle,
            marginBottom: "1.5rem",
            border: "1px solid rgba(61,168,122,0.35)",
            background: tk.isDark
              ? "rgba(61,168,122,0.12)"
              : "rgba(61,168,122,0.08)",
          }}
        >
          <p style={{ ...muted, margin: 0, color: "#3da87a" }}>{actionMessage}</p>
        </div>
      )}

      {dataLoading ? (
        <p style={{ ...muted, fontStyle: "italic" }}>Loading...</p>
      ) : (
        <>
          <div style={{ ...cardStyle, marginTop: "1.5rem" }}>
            <h2
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.25rem",
                margin: "0 0 0.25rem",
              }}
            >
              Contact Messages
            </h2>
            <p style={{ ...muted, margin: "0 0 1rem" }}>
              Messages submitted from the contact page.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {contactMessages.length === 0 && (
                <p style={{ ...muted, margin: 0 }}>No contact messages yet.</p>
              )}
              {contactMessages.map((msg) => {
                const isNew = msg.status === "new";
                const isBusy = updatingId === `contact-${msg.id}`;
                return (
                  <div
                    key={msg.id}
                    style={{
                      border: `1px solid ${isNew ? tk.goldBorder : tk.surfaceBorder}`,
                      borderRadius: "16px",
                      padding: "1rem",
                      background: isNew
                        ? tk.goldLight
                        : tk.isDark
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <h3
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "1.1rem",
                            margin: "0 0 0.25rem",
                          }}
                        >
                          {msg.full_name}
                        </h3>
                        <p style={{ ...muted, margin: "0 0 0.2rem" }}>{msg.email}</p>
                        <p style={{ ...muted, margin: 0, fontSize: "0.82rem" }}>
                          {msg.enquiry_type || "General"} ·{" "}
                          {msg.submitted_at
                            ? new Date(msg.submitted_at).toLocaleString()
                            : "Just now"}
                        </p>
                      </div>
                      <button
                        onClick={() => updateContactStatus(msg.id, isNew ? "read" : "new")}
                        disabled={isBusy}
                        style={{
                          border: `1px solid ${isNew ? "rgba(61,168,122,0.42)" : tk.goldBorder}`,
                          background: isNew ? "rgba(61,168,122,0.14)" : tk.goldLight,
                          color: isNew ? "#3da87a" : tk.gold,
                          borderRadius: "10px",
                          padding: "0.5rem 0.85rem",
                          cursor: isBusy ? "not-allowed" : "pointer",
                          fontFamily: "'Roboto Serif', Georgia, serif",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          minWidth: "108px",
                          opacity: isBusy ? 0.6 : 1,
                        }}
                      >
                        {isBusy ? "Saving..." : isNew ? "Mark read" : "Mark new"}
                      </button>
                    </div>
                    <p
                      style={{
                        ...muted,
                        color: tk.textPrimary,
                        margin: "0.85rem 0 0",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...cardStyle, marginTop: "1.5rem" }}>
            <h2
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.25rem",
                margin: "0 0 0.25rem",
              }}
            >
              Registered Users
            </h2>
            <p style={{ ...muted, margin: "0 0 1rem" }}>
              All users who have signed up via Supabase Auth.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {users.length === 0 && <p style={{ ...muted, margin: 0 }}>No registered users yet.</p>}
              {users.map((u) => {
                const isAdmin = u.role === "admin";
                return (
                  <div
                    key={u.id}
                    style={{
                      border: `1px solid ${tk.surfaceBorder}`,
                      borderRadius: "16px",
                      padding: "0.95rem 1rem",
                      background: tk.isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.55)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <h3
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "1.05rem",
                            margin: 0,
                          }}
                        >
                          {u.full_name || u.username || "-"}
                        </h3>
                        <span
                          style={{
                            fontFamily: "'Roboto Serif', Georgia, serif",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            padding: "0.15rem 0.55rem",
                            borderRadius: "999px",
                            background: isAdmin ? tk.goldLight : "rgba(100,100,100,0.1)",
                            color: isAdmin ? tk.gold : tk.textMuted,
                            border: `1px solid ${isAdmin ? tk.goldBorder : "rgba(100,100,100,0.2)"}`,
                          }}
                        >
                          {u.role?.toUpperCase() || "USER"}
                        </span>

                      </div>
                      <p style={{ ...muted, margin: 0, fontSize: "0.85rem" }}>{u.email}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
