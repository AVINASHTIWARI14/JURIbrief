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

        .home-right-character { transition: transform .25s ease; }

        @media (max-width: 1050px) {
          .home-right-character {
            right: 0.5rem !important;
            width: 190px !important;
          }
        }

        @media (max-width: 700px) {
          .home-right-character {
            display: none !important;
          }
        }

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

@media (max-width: 1150px) {
  .home-right-sticker {
    position: fixed !important;
    left: auto !important;
    right: 0.35rem !important;
    top: 54% !important;
    transform: translateY(-50%) !important;
    width: 115px !important;
    max-width: 24vw !important;
    z-index: 3 !important;
  }
}

@media (max-width: 700px) {
  .home-right-sticker {
    right: 0.2rem !important;
    width: 105px !important;
    max-width: 22vw !important;
  }
}

@media (max-width: 700px) {
  .home-right-sticker {
    display: none !important;
  }

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

      <img
        src="data:image/webp;base64,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"
        alt=""
        aria-hidden="true"
        className="home-right-character"
        style={{
          position: "fixed",
          right: "1.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(190px, 22vw, 300px)",
          height: "auto",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

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
