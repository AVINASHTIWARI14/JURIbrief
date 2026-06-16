import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTokens } from "../App";
import { useAuth } from "../context/AuthContext";

const API = "/api";

export default function Waitlist() {
  const tk = useTokens();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  // Public form state (used when not logged in)
  const [form, setForm] = useState({ full_name: "", email: "", reason: "" });
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Logged-in user state
  const [wlInfo, setWlInfo] = useState(null);
  const [wlLoading, setWlLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const loadWaitlistStatus = async () => {
    if (!user?.email) return;
    setWlLoading(true);
    try {
      const r = await axios.get(`${API}/waitlist/status`, { params: { email: user.email } });
      setWlInfo(r.data);
    } catch { /* non-fatal */ }
    finally { setWlLoading(false); }
  };

  useEffect(() => { loadWaitlistStatus(); }, [user]);

  // If user becomes approved, auto-redirect to dashboard
  useEffect(() => {
    if (profile?.approved) navigate("/dashboard", { replace: true });
  }, [profile]);

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      if (refreshProfile) await refreshProfile();
      await loadWaitlistStatus();
    } finally {
      setTimeout(() => setCheckingStatus(false), 600);
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (useAuthEmail = false) => {
    const email = useAuthEmail ? user?.email : form.email;
    const full_name = useAuthEmail ? (profile?.full_name || user?.email?.split("@")[0]) : form.full_name;
    const reason = useAuthEmail ? form.reason : form.reason;

    if (!full_name || !email) {
      setStatus("error");
      setMsg("Name and email are required.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await axios.post(`${API}/joinwaitlist`, { full_name, email, reason });
      setStatus("success");
      setMsg(useAuthEmail
        ? "Reason submitted. Admin will review soon."
        : "You're on the list! We'll reach out soon.");
      if (useAuthEmail) {
        await loadWaitlistStatus();
      } else {
        setForm({ full_name: "", email: "", reason: "" });
      }
    } catch (err) {
      setStatus("error");
      setMsg(
        err.response?.data?.error === "Email already registered"
          ? "This email is already on the waitlist."
          : err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: tk.inputBg,
    border: `1px solid ${tk.inputBorder}`,
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    fontSize: "0.9375rem",
    fontFamily: "'Roboto Serif', Georgia, serif",
    color: tk.textPrimary,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .25s",
  };

  // ═════════════════════════════════════════════════════════════════
  // LOGGED-IN VIEW — pending approval page
  // ═════════════════════════════════════════════════════════════════
  if (user) {
    const onList = wlInfo?.onWaitlist;
    const currentStatus = wlInfo?.status || "pending";
    const isDenied = currentStatus === "rejected";
    const position = wlInfo?.position;
    const submittedDate = wlInfo?.submittedAt ? new Date(wlInfo.submittedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : null;

    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1.5rem 4rem" }}>
        <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Status card */}
          <div style={{
            background: tk.surface, border: `1px solid ${tk.surfaceBorder}`,
            borderRadius: "20px", padding: "2.25rem", textAlign: "center",
            boxShadow: tk.isDark ? "0 20px 60px rgba(0,0,0,.35)" : "0 10px 40px rgba(0,0,0,.06)",
          }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", background: isDenied ? "rgba(224,82,82,0.12)" : tk.goldLight, border: `2px solid ${isDenied ? "rgba(224,82,82,0.35)" : tk.goldBorder}`, marginBottom: "1rem", fontSize: "1.75rem" }}>
              {isDenied ? "🚫" : "⏳"}
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(1.5rem,4vw,2rem)", color: tk.textPrimary, letterSpacing: "-0.01em", margin: "0 0 0.5rem" }}>
              {isDenied ? "Access not granted" : "Awaiting approval"}
            </h2>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", color: tk.textSecondary, fontSize: "1rem", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
              {isDenied
                ? "Your request was declined. Contact support if you believe this is an error."
                : "An admin is reviewing your request. You'll get dashboard access once approved."}
            </p>

            {/* Info grid */}
            {onList && !isDenied && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {position != null && (
                  <div style={{ padding: "0.75rem", borderRadius: "10px", background: tk.goldLight, border: `1px solid ${tk.goldBorder}` }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: tk.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Position</div>
                    <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: tk.gold, marginTop: "2px" }}>#{position}</div>
                  </div>
                )}
                {submittedDate && (
                  <div style={{ padding: "0.75rem", borderRadius: "10px", background: tk.goldLight, border: `1px solid ${tk.goldBorder}` }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: tk.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Submitted</div>
                    <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: tk.textPrimary, marginTop: "4px" }}>{submittedDate}</div>
                  </div>
                )}
                <div style={{ padding: "0.75rem", borderRadius: "10px", background: tk.goldLight, border: `1px solid ${tk.goldBorder}` }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: tk.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: tk.gold, marginTop: "4px", textTransform: "capitalize" }}>{currentStatus}</div>
                </div>
              </div>
            )}

            <button onClick={handleCheckStatus} disabled={checkingStatus} style={{
              width: "100%", padding: "0.85rem", borderRadius: "12px",
              fontFamily: "'Roboto Serif', Georgia, serif", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.04em",
              border: "none", cursor: checkingStatus ? "not-allowed" : "pointer",
              background: tk.btnBg, color: tk.btnText, opacity: checkingStatus ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              transition: "opacity .2s",
            }}>
              {checkingStatus ? "Checking…" : "🔄 Check Approval Status"}
            </button>

            <p style={{ fontSize: "0.78rem", color: tk.textMuted, marginTop: "0.75rem", fontFamily: "'Roboto Serif', Georgia, serif" }}>
              Signed in as <span style={{ color: tk.gold, fontWeight: 600 }}>{user.email}</span>
            </p>
          </div>

          {/* Speed-up form — only if not on waitlist yet and not denied */}
          {!wlLoading && !onList && !isDenied && (
            <div style={{ background: tk.surface, border: `1px solid ${tk.surfaceBorder}`, borderRadius: "20px", padding: "1.75rem", boxShadow: tk.isDark ? "0 20px 60px rgba(0,0,0,.35)" : "0 10px 40px rgba(0,0,0,.06)" }}>
              <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "1.15rem", color: tk.textPrimary, margin: "0 0 0.3rem" }}>
                Speed things up
              </h3>
              <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", color: tk.textSecondary, fontSize: "0.9rem", margin: "0 0 1rem", lineHeight: 1.55 }}>
                Tell us why you want access. Admins prioritize applicants who share their use case.
              </p>
              <textarea
                name="reason"
                placeholder="e.g. I'm a small-business owner reviewing vendor contracts regularly and need plain-English summaries…"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.6, marginBottom: "0.75rem" }}
                onFocus={(e) => (e.target.style.borderColor = tk.gold)}
                onBlur={(e) => (e.target.style.borderColor = tk.inputBorder)}
              />
              {status && (
                <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9rem", color: status === "success" ? tk.success : tk.danger, margin: "0 0 0.75rem" }}>
                  {msg}
                </p>
              )}
              <button onClick={() => handleSubmit(true)} disabled={loading} style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", fontFamily: "'Roboto Serif', Georgia, serif", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, background: tk.gold, color: "#fff" }}>
                {loading ? "Submitting…" : "Submit my reason"}
              </button>
            </div>
          )}

          {/* Show existing reason if on list */}
          {onList && wlInfo?.reason && (
            <div style={{ background: tk.surface, border: `1px solid ${tk.surfaceBorder}`, borderRadius: "20px", padding: "1.25rem 1.5rem" }}>
              <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.75rem", fontWeight: 700, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Your submitted reason</div>
              <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9rem", color: tk.textSecondary, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                "{wlInfo.reason}"
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // PUBLIC VIEW — original waitlist signup form
  // ═════════════════════════════════════════════════════════════════
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1.5rem 4rem" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: tk.surface, border: `1px solid ${tk.surfaceBorder}`, borderRadius: "20px", padding: "2.5rem", boxShadow: tk.isDark ? "0 32px 80px rgba(0,0,0,.5)" : "0 12px 48px rgba(0,0,0,.07)" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(1.5rem,4vw,2rem)", color: tk.textPrimary, letterSpacing: "-0.01em", margin: "0 0 0.375rem" }}>
          Join the Waitlist
        </h2>
        <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", color: tk.textSecondary, fontSize: "1.0625rem", margin: "0 0 1.75rem", lineHeight: 1.6 }}>
          Request access to Legal Ease AI — share why you need it and we'll review.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input name="full_name" placeholder="Full Name *" value={form.full_name} onChange={handleChange} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = tk.gold)} onBlur={(e) => (e.target.style.borderColor = tk.inputBorder)} />
          <input name="email" type="email" placeholder="Email Address *" value={form.email} onChange={handleChange} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = tk.gold)} onBlur={(e) => (e.target.style.borderColor = tk.inputBorder)} />
          <textarea name="reason" placeholder="Why do you want early access? (optional)" value={form.reason} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} onFocus={(e) => (e.target.style.borderColor = tk.gold)} onBlur={(e) => (e.target.style.borderColor = tk.inputBorder)} />

          {status && (
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", color: status === "success" ? tk.success : tk.danger, margin: 0 }}>
              {msg}
            </p>
          )}

          <button onClick={() => handleSubmit(false)} disabled={loading} style={{
            width: "100%", padding: "0.875rem", borderRadius: "12px",
            fontFamily: "'Roboto Serif', Georgia, serif", fontWeight: 600, fontSize: "1rem", letterSpacing: "0.04em",
            border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            background: tk.btnBg, color: tk.btnText, transition: "opacity .25s",
          }}>
            {loading ? "Submitting…" : "Join Waitlist →"}
          </button>
        </div>
      </div>
    </main>
  );
}
