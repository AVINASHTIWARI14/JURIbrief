import { useNavigate } from "react-router-dom";
import { useTokens } from "../App";
import { useAuth } from "../context/AuthContext";
import AuthPages from "./AuthPages";

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
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
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
        .hero-capability-wrap { position: relative; height: 1.7rem; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-top: 0.15rem; }
        .hero-capability { position: absolute; font-family: "'Roboto Serif'", Georgia, serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.025em; color: ${tk.gold}; opacity: 0; transform: translateY(8px); animation: capabilityFade 12s ease-in-out infinite; }
        .hero-capability-1 { animation-delay: 0s; } .hero-capability-2 { animation-delay: 3s; } .hero-capability-3 { animation-delay: 6s; } .hero-capability-4 { animation-delay: 9s; }
        @keyframes capabilityFade { 0%,4% { opacity:0; transform:translateY(8px); } 8%,21% { opacity:1; transform:translateY(0); } 25%,100% { opacity:0; transform:translateY(-8px); } }


        .hero-get-started {
          width: 9em;
          height: 3em;
          padding: 0;
          border-radius: 30em;
          font-family: inherit;
          font-size: 15px;
          border: none;
          position: relative;
          overflow: hidden;
          z-index: 1;
          background: #f4f0e6;
          color: #171717;
          box-shadow: none;
          transition: color .25s ease, transform .2s ease;
        }

        .hero-get-started::before {
          content: '';
          width: 0;
          height: 3em;
          border-radius: 30em;
          position: absolute;
          top: 0;
          left: 0;
          background: ${tk.gold};
          transition: .5s ease;
          display: block;
          z-index: -1;
        }

        .hero-get-started:hover {
          color: #fff;
        }

        .hero-get-started:hover::before {
          width: 9em;
        }
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

      <div
        style={{
          position: "absolute",
          left: "5rem",
          bottom: "0.75rem",
          display: "flex",
          alignItems: "flex-end",
          gap: "0.25rem",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <img
          src="/home-sticker-2.svg"
          alt=""
          aria-hidden="true"
          style={{
            width: "clamp(240px, 30vw, 420px)",
            height: "auto",
          }}
        />
      </div>

      {/* Hero sticker — placed directly to the right of the centered hero copy */}
      <div
        className="hero-right-sticker"
        style={{
          position: "absolute",
          left: "calc(50% + 300px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(180px, 18vw, 240px)",
          zIndex: 2,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src="/home-right-sticker.webp"
          alt=""
          aria-hidden="true"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </div>


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
              className="hero-get-started"
              style={{
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontWeight: 600,
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Started
            </button>
          </div>

          {/* Animated capability line + trust line */}
          <div className="hero-capability-wrap" aria-live="polite">
            <span className="hero-capability hero-capability-1">Upload Document</span>
            <span className="hero-capability hero-capability-2">Paste Text</span>
            <span className="hero-capability hero-capability-3">Compare Documents</span>
            <span className="hero-capability hero-capability-4">Generate Documents</span>
          </div>

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
