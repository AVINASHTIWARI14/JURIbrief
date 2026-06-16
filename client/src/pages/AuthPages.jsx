import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "../App";
import { useAuth } from "../context/AuthContext";
import LogoMark from "../components/LogoMark";

// ── Shared input styles ──────────────────────────────────────────────────────
function useStyles(tk) {
  return {
    input: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "10px",
      border: `1.5px solid ${tk.inputBorder}`,
      background: tk.inputBg,
      color: tk.textPrimary,
      fontFamily: "'Roboto Serif', Georgia, serif",
      fontSize: "1.0625rem",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    label: {
      fontFamily: "'Roboto Serif', Georgia, serif",
      fontSize: "0.8rem",
      fontWeight: 700,
      color: tk.textSecondary,
      letterSpacing: "0.08em",
      display: "block",
      marginBottom: "0.4rem",
    },
  };
}

// ── Google icon SVG ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Error / success banners ──────────────────────────────────────────────────
function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.35)", borderRadius: "10px", padding: "0.7rem 1rem", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", color: "#e05252", animation: "shake 0.4s ease", lineHeight: 1.5 }}>
      {msg}
    </div>
  );
}

function SuccessBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: "rgba(61,168,122,0.12)", border: "1px solid rgba(61,168,122,0.35)", borderRadius: "10px", padding: "0.7rem 1rem", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", color: "#3da87a", lineHeight: 1.5 }}>
      {msg}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AuthPages() {
  const tk = useTokens();
  const styles = useStyles(tk);
  const navigate = useNavigate();
  const { user, profile, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  // "login" | "register" | "forgot" | "aadhaar"
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!loading && user) {
      if (profile?.approved) navigate("/dashboard", { replace: true });
      else navigate("/waitlist", { replace: true });
    }
  }, [user, profile, loading]);

  const reset = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    setForm({ fullName: "", email: "", password: "" });
  };

  const handle = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = tk.gold;
    e.target.style.boxShadow = `0 0 0 3px ${tk.goldLight}`;
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = tk.inputBorder;
    e.target.style.boxShadow = "none";
  };

  // ── Submit handlers ────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError("Email and password are required");
    setBusy(true);
    const { error: err } = await signIn(form.email, form.password);
    setBusy(false);
    if (err) return setError(err.message);
    // Redirect handled by useEffect above once auth state updates
  };

  const handleRegister = async () => {
    if (!form.fullName.trim()) return setError("Full name is required");
    if (!form.email) return setError("Email is required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setBusy(true);

    // Gate: email must be on the waitlist before registration is allowed
    try {
      const r = await fetch(`/api/waitlist/status?email=${encodeURIComponent(form.email)}`);
      const data = await r.json();
      if (!data.onWaitlist) {
        setBusy(false);
        return setError("This email is not on the waitlist. Please join the waitlist from the home page first.");
      }
      if (data.status === "rejected") {
        setBusy(false);
        return setError("Your waitlist request was declined. Please contact support.");
      }
    } catch {
      setBusy(false);
      return setError("Could not verify waitlist status. Please try again.");
    }

    const { error: err } = await signUp(form.email, form.password, form.fullName.trim());
    setBusy(false);
    if (err) return setError(err.message);
    setSuccess("Account created! Please check your email to confirm.");
    setTimeout(() => navigate("/waitlist"), 2500);
  };

  const handleForgot = async () => {
    if (!form.email) return setError("Please enter your email address");
    setBusy(true);
    const { error: err } = await resetPassword(form.email);
    setBusy(false);
    if (err) return setError(err.message);
    setSuccess("Password reset link sent — check your inbox.");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err.message); setBusy(false); }
    // On success, browser is redirected — no further action needed
  };

  const handleSubmit = () => {
    if (mode === "login") handleLogin();
    else if (mode === "register") handleRegister();
    else if (mode === "forgot") handleForgot();
  };

  // ── Card wrapper ───────────────────────────────────────────────────────────
  const cardStyle = {
    width: "100%",
    maxWidth: "460px",
    background: tk.surface,
    border: `1px solid ${tk.goldBorder}`,
    borderRadius: "24px",
    padding: "2.5rem 2.25rem",
    boxShadow: tk.isDark
      ? "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,220,100,0.07)"
      : "0 24px 60px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
    backdropFilter: "blur(24px)",
    animation: "authIn 0.4s cubic-bezier(.22,1,.36,1)",
  };

  const primaryBtn = (label, onClick, disabled) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "0.9rem", borderRadius: "12px", border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? tk.textMuted : (tk.isDark ? "#c9a84c" : "#1a160c"),
        color: tk.isDark ? "#0e0e0f" : "#f9f7f4",
        fontFamily: "'Roboto Serif', Georgia, serif",
        fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "0.06em",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {label}
    </button>
  );

  const divider = (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
      <div style={{ flex: 1, height: "1px", background: tk.divider }} />
      <span style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", color: tk.textMuted, letterSpacing: "0.06em" }}>OR</span>
      <div style={{ flex: 1, height: "1px", background: tk.divider }} />
    </div>
  );

  const googleBtn = (
    <button
      onClick={handleGoogle}
      disabled={busy}
      style={{
        width: "100%", padding: "0.75rem", borderRadius: "12px",
        border: `1.5px solid ${tk.surfaceBorder}`,
        background: tk.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
        color: tk.textPrimary, cursor: busy ? "not-allowed" : "pointer",
        fontFamily: "'Roboto Serif', Georgia, serif",
        fontSize: "1rem", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { if (!busy) e.currentTarget.style.borderColor = tk.gold; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.surfaceBorder; }}
    >
      <GoogleIcon /> Continue with Google
    </button>
  );

  // ── Aadhaar stub ──────────────────────────────────────────────────────────
  if (mode === "aadhaar") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 1.5rem 2rem" }}>
        <div style={cardStyle}>
          <style>{`@keyframes authIn { from{opacity:0;transform:translateY(20px) scale(.98)} to{opacity:1;transform:none} }`}</style>
          <button onClick={() => reset("login")} style={{ background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, borderRadius: "8px", padding: "0.375rem 0.75rem", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8125rem", fontWeight: 600, color: tk.gold, cursor: "pointer", marginBottom: "1.5rem" }}>
            ← Back to Login
          </button>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🪪</div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: tk.textPrimary, margin: "0 0 0.4rem" }}>Aadhaar Login</h2>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", color: tk.textMuted, fontSize: "0.95rem", fontStyle: "italic", margin: 0 }}>Government ID-based verification</p>
          </div>
          <div style={{ background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9rem", color: tk.gold, fontWeight: 600, margin: "0 0 0.35rem" }}>Integration Pending</p>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", color: tk.textSecondary, lineHeight: 1.6, margin: 0 }}>
              Aadhaar-based login via UIDAI's official API requires government approval and a registered entity. This feature is stubbed and will be activated once API access is granted.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={styles.label}>AADHAAR NUMBER</label>
              <input placeholder="XXXX XXXX XXXX" disabled style={{ ...styles.input, opacity: 0.5, cursor: "not-allowed" }} />
            </div>
            <div>
              <label style={styles.label}>MOBILE NUMBER (linked to Aadhaar)</label>
              <input placeholder="+91 XXXXX XXXXX" disabled style={{ ...styles.input, opacity: 0.5, cursor: "not-allowed" }} />
            </div>
            <button disabled style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", border: "none", background: tk.textMuted, color: "#fff", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1.0625rem", fontWeight: 700, cursor: "not-allowed", opacity: 0.6 }}>
              Send OTP (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Forgot password view ───────────────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 1.5rem 2rem" }}>
        <div style={cardStyle}>
          <style>{`@keyframes authIn { from{opacity:0;transform:translateY(20px) scale(.98)} to{opacity:1;transform:none} } @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`}</style>
          <button onClick={() => reset("login")} style={{ background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, borderRadius: "8px", padding: "0.375rem 0.75rem", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8125rem", fontWeight: 600, color: tk.gold, cursor: "pointer", marginBottom: "1.5rem" }}>
            ← Back to Login
          </button>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: tk.textPrimary, margin: "0 0 0.4rem" }}>Reset Password</h2>
          <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", color: tk.textMuted, fontSize: "0.95rem", margin: "0 0 1.5rem" }}>Enter your email and we will send a reset link.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={styles.label}>EMAIL</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" style={styles.input} onFocus={focusStyle} onBlur={blurStyle} onKeyDown={(e) => e.key === "Enter" && handleForgot()} />
            </div>
            <ErrorBanner msg={error} />
            <SuccessBanner msg={success} />
            {primaryBtn(busy ? "Sending…" : "Send Reset Link", handleForgot, busy)}
          </div>
        </div>
      </div>
    );
  }

  // Don't flash the auth form while session is loading or when user is already logged in (about to redirect)
  if (loading || user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: tk.textMuted, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", fontStyle: "italic" }}>
        Loading…
      </div>
    );
  }

  // ── Login / Register view ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 1.5rem 2rem" }}>
      <div style={cardStyle}>
        <style>{`
          @keyframes authIn { from{opacity:0;transform:translateY(20px) scale(.98)} to{opacity:1;transform:none} }
          @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        `}</style>

        {/* Logo + title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: tk.goldLight, border: `1.5px solid ${tk.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <LogoMark size={26} isDark={tk.isDark} />
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.875rem", fontWeight: 400,
            letterSpacing: "0.04em", margin: "0 0 0.3rem",
            color: tk.isDark ? "#f2eed8" : "#1a160c",
          }}>
            Legal Ease AI
          </h1>
          <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", color: tk.textMuted, fontStyle: "italic", margin: 0 }}>
            {mode === "login" ? "Welcome back to your account" : "Create a new account"}
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", background: tk.inputBg, border: `1px solid ${tk.surfaceBorder}`, borderRadius: "12px", padding: "4px", marginBottom: "1.75rem" }}>
          {["login", "register"].map((m) => (
            <button key={m} onClick={() => reset(m)} style={{ flex: 1, padding: "0.6rem", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", fontWeight: 600, letterSpacing: "0.04em", background: mode === m ? (tk.isDark ? "#c9a84c" : "#1a160c") : "transparent", color: mode === m ? (tk.isDark ? "#0e0e0f" : "#f9f7f4") : tk.textSecondary, transition: "all 0.2s" }}>
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Full name (register only) */}
          {mode === "register" && (
            <div>
              <label style={styles.label}>FULL NAME</label>
              <input name="fullName" value={form.fullName} onChange={handle} placeholder="Your full name" style={styles.input} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={styles.label}>EMAIL</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" style={styles.input} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          {/* Password */}
          <div>
            <label style={styles.label}>PASSWORD</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" style={styles.input} onFocus={focusStyle} onBlur={blurStyle} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            {mode === "register" && (
              <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", color: tk.textMuted, margin: "0.35rem 0 0 0.25rem" }}>At least 6 characters</p>
            )}
          </div>

          {/* Forgot password link */}
          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: "-0.4rem" }}>
              <span onClick={() => reset("forgot")} style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", color: tk.gold, cursor: "pointer", fontWeight: 600 }}>
                Forgot password?
              </span>
            </div>
          )}

          <ErrorBanner msg={error} />
          <SuccessBanner msg={success} />

          {/* Primary submit button */}
          {primaryBtn(busy ? "Please wait…" : mode === "login" ? "Login" : "Create Account", handleSubmit, busy)}

          {/* Divider + Google */}
          {divider}
          {googleBtn}

          {/* Aadhaar option */}
          <button
            onClick={() => reset("aadhaar")}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: `1.5px solid ${tk.surfaceBorder}`, background: "transparent", color: tk.textSecondary, cursor: "pointer", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", transition: "border-color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.surfaceBorder; }}
          >
            🪪 Login with Aadhaar
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${tk.gold}, transparent)`, margin: "1.75rem 0" }} />

        {/* Switch mode link */}
        <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", color: tk.textMuted, textAlign: "center", margin: 0, lineHeight: 1.6 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => reset(mode === "login" ? "register" : "login")} style={{ color: tk.gold, cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Register here" : "Login here"}
          </span>
        </p>
      </div>
    </div>
  );
}
