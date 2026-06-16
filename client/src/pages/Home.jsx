import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTokens } from "../App";

const API = "/api";

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Analysis",
    desc: "Complete clause breakdown in under 5 seconds.",
  },
  {
    icon: "📖",
    title: "Plain English",
    desc: "Legal jargon translated for real people.",
  },
  {
    icon: "🛡️",
    title: "Risk Flags",
    desc: "Unfavorable or dangerous terms highlighted automatically.",
  },
];

export default function Home() {
  const tk = useTokens();

  // Waitlist state
  const [wForm, setWForm] = useState({ full_name: "", email: "", reason: "" });
  const [wStatus, setWStatus] = useState(null);
  const [wMsg, setWMsg] = useState("");
  const [wLoading, setWLoading] = useState(false);

  const handleWChange = (e) =>
    setWForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleWSubmit = async () => {
    if (!wForm.full_name || !wForm.email) {
      setWStatus("error");
      setWMsg("Name and email are required.");
      return;
    }
    setWLoading(true);
    setWStatus(null);
    try {
      await axios.post(`${API}/joinwaitlist`, wForm);
      setWStatus("success");
      setWMsg("You're on the list! We'll reach out soon.");
      setWForm({ full_name: "", email: "", reason: "" });
    } catch (err) {
      setWStatus("error");
      setWMsg(
        err.response?.data?.error === "Email already registered"
          ? "This email is already registered."
          : "Something went wrong. Please try again."
      );
    } finally {
      setWLoading(false);
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

  return (
    <main style={{ position: "relative", minHeight: "100vh" }}>
      <style>{`
        textarea::placeholder { color: ${tk.textMuted}; }
        input::placeholder { color: ${tk.textMuted}; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .hero-badge   { animation: heroIn .7s cubic-bezier(.22,1,.36,1) .05s both; }
        .hero-line1   { animation: heroIn .7s cubic-bezier(.22,1,.36,1) .12s both; }
        .hero-line2   { animation: heroIn .7s cubic-bezier(.22,1,.36,1) .20s both; }
        .hero-sub     { animation: heroIn .7s cubic-bezier(.22,1,.36,1) .28s both; }
        .hero-cta     { animation: heroIn .7s cubic-bezier(.22,1,.36,1) .36s both; }
        .hero-trust   { animation: heroIn .7s cubic-bezier(.22,1,.36,1) .44s both; }
        .feat-card    { animation: heroIn .7s cubic-bezier(.22,1,.36,1) both; }
        .feat-card:nth-child(1) { animation-delay: .52s; }
        .feat-card:nth-child(2) { animation-delay: .60s; }
        .feat-card:nth-child(3) { animation-delay: .68s; }
        .waitlist-card { animation: heroIn .7s cubic-bezier(.22,1,.36,1) .76s both; }
      `}</style>

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 1.5rem 4rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.25rem",
          }}
        >
          {/* Badge */}
          <span
            className="hero-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              background: tk.goldLight,
              border: `1px solid ${tk.goldBorder}`,
              color: tk.gold,
              fontFamily: "'Roboto Serif', Georgia, serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.3rem 1rem",
              borderRadius: "999px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: tk.success,
                animation: "pulse-dot 2s infinite",
                display: "inline-block",
              }}
            />
            AI-powered legal analysis
          </span>

          {/* Heading */}
          <h1 style={{ margin: 0 }}>
            <span
              className="hero-line1"
              style={{
                display: "block",
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontWeight: 400,
                color: tk.textPrimary,
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Understand Legal Documents
            </span>
            <span
              className="hero-line2"
              style={{
                display: "block",
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontWeight: 400,
                fontStyle: "italic",
                color: tk.gold,
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              in Seconds
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-sub"
            style={{
              fontFamily: "'Roboto Serif', Georgia, serif",
              color: tk.textSecondary,
              fontSize: "1.125rem",
              fontWeight: 400,
              maxWidth: "480px",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            No jargon. Just clear, plain-English explanations of contracts,
            leases, and agreements — powered by AI.
          </p>

          {/* CTA Button */}
          <div
            className="hero-cta"
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "0.75rem",
            }}
          >
            <Link
              to="/auth"
              style={{
                padding: "0.85rem 1.75rem",
                borderRadius: "12px",
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontWeight: 600,
                fontSize: "1rem",
                letterSpacing: "0.04em",
                background: tk.btnBg,
                color: tk.btnText,
                textDecoration: "none",
                transition: "opacity .2s, transform .15s",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Started →
            </Link>
            <Link
              to="/about"
              style={{
                padding: "0.85rem 1.75rem",
                borderRadius: "12px",
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontWeight: 600,
                fontSize: "1rem",
                letterSpacing: "0.04em",
                background: "transparent",
                border: `1px solid ${tk.goldBorder}`,
                color: tk.gold,
                textDecoration: "none",
                transition: "background .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tk.goldLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Learn more
            </Link>
          </div>

          {/* Trust line */}
          <p
            className="hero-trust"
            style={{
              fontFamily: "'Roboto Serif', Georgia, serif",
              fontSize: "0.85rem",
              color: tk.textMuted,
              fontWeight: 400,
              margin: "0.5rem 0 0",
            }}
          >
            Your document is never stored · Analysis happens in real time
          </p>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feat-card"
              style={{
                background: tk.surface,
                border: `1px solid ${tk.surfaceBorder}`,
                borderRadius: "16px",
                padding: "1.5rem 1.5rem",
                textAlign: "left",
                transition: "transform .25s, border-color .25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = tk.goldBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = tk.surfaceBorder;
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: tk.goldLight,
                  border: `1px solid ${tk.goldBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  marginBottom: "0.9rem",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.1rem",
                  fontWeight: 400,
                  color: tk.textPrimary,
                  margin: "0 0 0.35rem",
                  letterSpacing: "0.01em",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Roboto Serif', Georgia, serif",
                  fontSize: "0.9rem",
                  color: tk.textSecondary,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Waitlist Section ─────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem 1.5rem 6rem",
        }}
      >
        <div
          className="waitlist-card"
          style={{
            width: "100%",
            maxWidth: "520px",
            margin: "0 auto",
            background: tk.surface,
            border: `1px solid ${tk.surfaceBorder}`,
            borderRadius: "20px",
            padding: "2.25rem",
            boxShadow: tk.isDark
              ? "0 20px 60px rgba(0,0,0,.35)"
              : "0 10px 40px rgba(0,0,0,.06)",
            textAlign: "left",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                background: tk.goldLight,
                border: `1px solid ${tk.goldBorder}`,
                color: tk.gold,
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.2rem 0.75rem",
                borderRadius: "999px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "0.6rem",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: tk.success,
                  animation: "pulse-dot 2s infinite",
                  display: "inline-block",
                }}
              />
              Early Access
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontWeight: 400,
                fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                color: tk.textPrimary,
                letterSpacing: "-0.01em",
                margin: "0.5rem 0 0.375rem",
              }}
            >
              Join the Waitlist
            </h2>
            <p
              style={{
                fontFamily: "'Roboto Serif', Georgia, serif",
                color: tk.textSecondary,
                fontSize: "0.95rem",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              Tell us why you need Legal Ease AI — we review every request before granting access.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <input
              name="full_name"
              placeholder="Full Name *"
              value={wForm.full_name}
              onChange={handleWChange}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = tk.gold)}
              onBlur={(e) => (e.target.style.borderColor = tk.inputBorder)}
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address *"
              value={wForm.email}
              onChange={handleWChange}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = tk.gold)}
              onBlur={(e) => (e.target.style.borderColor = tk.inputBorder)}
            />
            <textarea
              name="reason"
              placeholder="Why do you want early access? (optional)"
              value={wForm.reason}
              onChange={handleWChange}
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              onFocus={(e) => (e.target.style.borderColor = tk.gold)}
              onBlur={(e) => (e.target.style.borderColor = tk.inputBorder)}
            />

            {wStatus && (
              <p
                style={{
                  fontFamily: "'Roboto Serif', Georgia, serif",
                  fontSize: "0.9rem",
                  color: wStatus === "success" ? tk.success : tk.danger,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {wMsg}
              </p>
            )}

            <button
              onClick={handleWSubmit}
              disabled={wLoading}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontWeight: 600,
                fontSize: "1rem",
                letterSpacing: "0.04em",
                border: "none",
                cursor: wLoading ? "not-allowed" : "pointer",
                opacity: wLoading ? 0.6 : 1,
                background: tk.btnBg,
                color: tk.btnText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "opacity .25s",
              }}
              onMouseEnter={(e) =>
                !wLoading && (e.currentTarget.style.opacity = "0.82")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = wLoading ? "0.6" : "1")
              }
            >
              {wLoading ? (
                <>
                  <svg
                    style={{
                      animation: "spin 1s linear infinite",
                      width: "15px",
                      height: "15px",
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Submitting…
                </>
              ) : (
                "Join Waitlist →"
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
