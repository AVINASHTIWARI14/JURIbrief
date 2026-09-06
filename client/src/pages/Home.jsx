import { useNavigate } from "react-router-dom";
import { useTokens } from "../App";
import { useAuth } from "../context/AuthContext";
import AuthPages from "./AuthPages";

const FEATURES = [
  {
    title: "Instant Analysis",
    desc: "Get a clear breakdown of your document without digging through every clause.",
    className: "red",
  },
  {
    title: "Multiple Languages",
    desc: "Understand legal terms in familiar language, with support across multiple languages.",
    className: "blue",
  },
  {
    title: "Risk & Deadline Flags",
    desc: "Spot risky clauses, important actions, and deadlines before they slip past you.",
    className: "green",
  },
];

export default function Home() {
  const tk = useTokens();

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard", { state: { fromHome: true } });
      return;
    }
    document.getElementById("home-auth")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main style={{ position: "relative", minHeight: "100vh" }}>
      <style>{`
        textarea::placeholder { color: ${tk.textMuted}; }
        input::placeholder { color: ${tk.textMuted}; }
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
        .cards .card:hover {
  transform: scale(1.08);
}

.cards:hover > .card:not(:hover) {
  filter: blur(5px);
  transform: scale(0.96);
}

@media (max-width: 700px) {
  .cards {
    flex-direction: column !important;
    align-items: center !important;
  }

  .cards .card {
    width: 100%;
    max-width: 360px;
  }
}
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
            Understand what you’re signing before you sign it,
Because the fine print shouldn’t be the part you skip.
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
            <button
              type="button"
              onClick={handleGetStarted}
              disabled={authLoading}
              style={{
                padding: "0.85rem 1.75rem", borderRadius: "12px", border: "none",
                fontFamily: "'Roboto Serif', Georgia, serif", fontWeight: 600,
                fontSize: "1rem", letterSpacing: "0.04em", background: tk.btnBg,
                color: tk.btnText, cursor: authLoading ? "wait" : "pointer",
                transition: "opacity .2s, transform .15s",
              }}
              onMouseEnter={(e) => {
                if (!authLoading) { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }
              }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get Started →
            </button>
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
    padding: "2rem 1.5rem 4.5rem",
  }}
>
  <div
    className="cards"
    style={{
      maxWidth: "900px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "row",
      gap: "15px",
      justifyContent: "center",
      alignItems: "stretch",
      flexWrap: "wrap",
    }}
  >
    {FEATURES.map((f) => (
      <div
        key={f.title}
        className={`card ${f.className}`}
        style={{
          flex: "1 1 250px",
          minHeight: "145px",
          borderRadius: "12px",
          backgroundColor: "#f4f0e6",
          color: "#171717",
          cursor: "pointer",
          transition: "400ms",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: "1.5rem",
          boxSizing: "border-box",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.25rem",
            fontWeight: 500,
            margin: "0 0 0.65rem",
            color: "#171717",
          }}
        >
          {f.title}
        </p>

        <p
          style={{
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: "0.85rem",
            lineHeight: 1.5,
            margin: 0,
            color: "#555",
            maxWidth: "230px",
          }}
        >
          {f.desc}
        </p>
      </div>
    ))}
  </div>
</section>

   
      {/* ─── Login / Register Section ───────────────────────────── */}
      {!authLoading && !user && (
        <section
          id="home-auth"
          style={{
            position: "relative", zIndex: 1, scrollMarginTop: "5.5rem",
            padding: "3rem 1.5rem 5rem",
          }}
        >
          <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 400, color: tk.textPrimary, margin: 0 }}>
              Ready to get started?
            </h2>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", color: tk.textSecondary, fontSize: "1rem", lineHeight: 1.6, margin: "0.65rem auto 0", maxWidth: "520px" }}>
              Login to your account or register to start working with your legal documents.
            </p>
          </div>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <AuthPages />
          </div>
        </section>
      )}

    </main>
  );
}
