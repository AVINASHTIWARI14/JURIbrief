import PrivacyPolicy from "./pages/PrivacyPolicy";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Waitlist from "./pages/Waitlist";
import Admin from "./pages/Admin";
import Auth from "./pages/AuthPages";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import JuriChat from "./components/JuriChat";
import SmartBook from "./components/SmartBook";

export const ThemeContext = createContext(null);
export function useTheme() {
  return useContext(ThemeContext);
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ── Breathe keyframes injected once ─────────────────────────────
function DotBackground() {
  return (
    <style>{`@keyframes breathe { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
  );
}

function JuriFace({ size = 32, smiling = false }) {
  // Palette
  const skin = "#f4d2b4";
  const skinShade = "#e0b898";
  const hair = "#3a2418";
  const hairLight = "#5a3a26";
  const lips = "#c04a4a";
  const feature = "#1a160c";
  const blush = "rgba(232,130,120,0.6)";

  // Design fills the full 48x48 viewBox — when placed in a circular button with
  // overflow:hidden + borderRadius:50%, the face fills the circle edge-to-edge.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background wash (face warm tone fills whole circle) */}
      <rect width="48" height="48" fill={skin} />

      {/* Back / side hair — covers the top & frames the sides */}
      <path
        d="M0 24 Q0 4 24 2 Q48 4 48 24 L48 48 L38 48 Q38 34 36 24 Q30 18 24 18 Q18 18 12 24 Q10 34 10 48 L0 48 Z"
        fill={hair}
      />

      {/* Face oval (covers a bit of the back hair so face reads clean) */}
      <ellipse cx="24" cy="27" rx="14" ry="15" fill={skin} />

      {/* Hair fringe / bangs */}
      <path
        d="M10 20 Q12 10 24 8 Q36 10 38 20 Q34 14 28 16 Q24 13 20 16 Q14 14 10 20 Z"
        fill={hair}
      />
      <path
        d="M11 20 Q17 16 24 18 Q31 16 37 20"
        stroke={hairLight}
        strokeWidth="0.6"
        fill="none"
        opacity="0.7"
      />

      {/* Subtle chin shading */}
      <path
        d="M14 36 Q24 44 34 36"
        stroke={skinShade}
        strokeWidth="0.6"
        fill="none"
        opacity="0.4"
      />

      {/* Eyebrows */}
      {smiling ? (
        <>
          <path
            d="M14.5 22 Q18 20.5 21 22"
            stroke={hair}
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M27 22 Q30 20.5 33.5 22"
            stroke={hair}
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M15 23 Q18 22 21 23"
            stroke={hair}
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M27 23 Q30 22 33 23"
            stroke={hair}
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Eyes */}
      {smiling ? (
        // Happy / squinted curved arcs
        <>
          <path
            d="M15 27 Q18 24.5 21 27"
            stroke={feature}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M27 27 Q30 24.5 33 27"
            stroke={feature}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        // Neutral — filled ovals with tiny highlight
        <>
          <ellipse
            cx="18.5"
            cy="27"
            rx="1.4"
            ry="1.9"
            fill={feature}
          />
          <ellipse
            cx="29.5"
            cy="27"
            rx="1.4"
            ry="1.9"
            fill={feature}
          />
          <circle cx="18.9" cy="26.4" r="0.45" fill="#fff" />
          <circle cx="29.9" cy="26.4" r="0.45" fill="#fff" />
        </>
      )}

      {/* Nose hint */}
      <path
        d="M24 29 Q23 32 24.4 33"
        stroke={skinShade}
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Cheek blush (always on, stronger when smiling) */}
      <circle
        cx="14.5"
        cy="33"
        r={smiling ? "2.4" : "1.6"}
        fill={blush}
        opacity={smiling ? 0.9 : 0.5}
      />
      <circle
        cx="33.5"
        cy="33"
        r={smiling ? "2.4" : "1.6"}
        fill={blush}
        opacity={smiling ? 0.9 : 0.5}
      />

      {/* Mouth */}
      {smiling ? (
        <path
          d="M18 36 Q24 42 30 36"
          stroke={lips}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M20 36 Q24 37.5 28 36"
          stroke={lips}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Gold earrings */}
      <circle cx="7.5" cy="30" r="1.2" fill="#c9a84c" />
      <circle cx="40.5" cy="30" r="1.2" fill="#c9a84c" />
    </svg>
  );
}

function AILawyerBtn({ onPickChat }) {
  const tk = useTokens();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const close = () => setMenuOpen(false);

    const t = setTimeout(
      () => window.addEventListener("click", close, { once: true }),
      50
    );

    return () => {
      clearTimeout(t);
      window.removeEventListener("click", close);
    };
  }, [menuOpen]);

  // Menu item now contains text only — no icon box
  const menuItem = (title, subtitle, onClick) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setMenuOpen(false);
        onClick();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "0.75rem 0.9rem",
        background: "transparent",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = tk.goldLight)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: tk.textPrimary,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: "0.75rem",
            color: tk.textMuted,
            marginTop: "2px",
          }}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
      }}
    >
      {/* Hover tooltip */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(100% + 0.75rem)",
          right: 0,
          background: tk.isDark
            ? "rgba(22,20,18,0.97)"
            : "rgba(255,254,252,0.97)",
          border: `1px solid ${tk.goldBorder}`,
          borderRadius: "12px",
          padding: "0.5rem 0.875rem",
          boxShadow: tk.isDark
            ? "0 8px 32px rgba(0,0,0,0.5)"
            : "0 8px 24px rgba(0,0,0,0.12)",
          whiteSpace: "nowrap",
          fontFamily: "'Roboto Serif', Georgia, serif",
          fontSize: "0.8125rem",
          color: tk.textSecondary,
          pointerEvents: "none",
          opacity: hovered && !menuOpen ? 1 : 0,
          transform:
            hovered && !menuOpen
              ? "translateY(0)"
              : "translateY(6px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        Stuck?{" "}
        <span style={{ color: tk.gold, fontWeight: 600 }}>
          Juri
        </span>{" "}
        is here to help

        <div
          style={{
            position: "absolute",
            bottom: "-5px",
            right: "18px",
            width: "10px",
            height: "10px",
            background: tk.isDark
              ? "rgba(22,20,18,0.97)"
              : "rgba(255,254,252,0.97)",
            border: `1px solid ${tk.goldBorder}`,
            borderTop: "none",
            borderLeft: "none",
            transform: "rotate(45deg)",
            borderRadius: "0 0 2px 0",
          }}
        />
      </div>

      {/* Choice menu */}
      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: "calc(100% + 0.75rem)",
            right: 0,
            width: "260px",
            background: tk.isDark
              ? "rgba(22,20,18,0.98)"
              : "rgba(255,254,252,0.98)",
            border: `1px solid ${tk.goldBorder}`,
            borderRadius: "14px",
            padding: "0.4rem",
            boxShadow: tk.isDark
              ? "0 20px 60px rgba(0,0,0,0.6)"
              : "0 10px 40px rgba(0,0,0,0.12)",
            animation: "menuIn 0.2s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <style>{`
            @keyframes menuIn {
              from {
                opacity: 0;
                transform: translateY(6px) scale(.97);
              }
              to {
                opacity: 1;
                transform: none;
              }
            }
          `}</style>

          {menuItem(
            "Ask Juri",
            "Chat about your document",
            onPickChat
          )}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "68px",
          height: "68px",
          borderRadius: "50%",
          background: menuOpen
            ? `linear-gradient(135deg, ${tk.gold}, #a07830)`
            : tk.isDark
            ? "#fdf5e8"
            : "#fff8ec",
          border: `2px solid ${
            menuOpen ? tk.gold : tk.goldBorder
          }`,
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            hovered || menuOpen
              ? tk.isDark
                ? "0 0 0 8px rgba(201,168,76,0.12), 0 12px 32px rgba(0,0,0,0.5)"
                : "0 0 0 8px rgba(201,168,76,0.18), 0 12px 32px rgba(0,0,0,0.15)"
              : tk.isDark
              ? "0 4px 20px rgba(0,0,0,0.5)"
              : "0 4px 20px rgba(0,0,0,0.12)",
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
          padding: 0,
          color: menuOpen ? "#fff" : undefined,
        }}
      >
        {menuOpen ? (
          <span
            style={{
              fontSize: "1.4rem",
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontWeight: 700,
            }}
          >
            ✕
          </span>
        ) : (
          <JuriFace size={68} smiling={hovered} />
        )}
      </button>
    </div>
  );
}

export function useTokens() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return {
    isDark,
    bg: isDark ? "#0a0a0a" : "#dcdcdc",
    surface: isDark
      ? "rgba(22,20,18,0.88)"
      : "rgba(218,212,200,0.90)",
    surfaceBorder: isDark
      ? "rgba(255,220,100,0.10)"
      : "rgba(160,120,40,0.15)",
    gold: isDark ? "#c9a84c" : "#a07830",
    goldLight: isDark
      ? "rgba(201,168,76,0.12)"
      : "rgba(160,120,40,0.09)",
    goldBorder: isDark
      ? "rgba(201,168,76,0.25)"
      : "rgba(160,120,40,0.22)",
    textPrimary: isDark ? "#f2eed8" : "#1a160c",
    textSecondary: isDark
      ? "rgba(242,238,216,0.72)"
      : "rgba(26,22,12,0.68)",
    textMuted: isDark
      ? "rgba(242,238,216,0.48)"
      : "rgba(26,22,12,0.42)",
    inputBg: isDark
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.025)",
    inputBorder: isDark
      ? "rgba(255,220,100,0.14)"
      : "rgba(160,120,40,0.16)",
    divider: isDark
      ? "rgba(255,220,100,0.08)"
      : "rgba(160,120,40,0.10)",
    btnBg: isDark ? "#c9a84c" : "#1a160c",
    btnText: isDark ? "#0e0e0f" : "#f9f7f4",
    danger: "#e05252",
    success: "#3da87a",
  };
}

function InitialHomeRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    // Every fresh app entry/reload starts on Home. Internal navigation is untouched.
    const navigation = performance.getEntriesByType("navigation")[0];
    const isFreshEntry = navigation?.type === "navigate" || navigation?.type === "reload";

    if (isFreshEntry && location.pathname === "/dashboard") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        <Route
          path="/about"
          element={
            <PageWrapper>
              <About />
            </PageWrapper>
          }
        />

        <Route
          path="/contact"
          element={
            <PageWrapper>
              <Contact />
            </PageWrapper>
          }
        />

        <Route
          path="/waitlist"
          element={
            <PageWrapper>
              <Waitlist />
            </PageWrapper>
          }
        />

        <Route
          path="/auth"
          element={
            <PageWrapper>
              <Auth />
            </PageWrapper>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </PageWrapper>
          }
        />

        <Route
          path="/admin"
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function SmartBookBtn({ onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: "2rem", left: "2rem", zIndex: 9999 }}>
      <style>{`
        .cssbuttonsIoButton {
          background: black;
          color: white;
          font-family: inherit;
          border: 1px solid white;
          text-align: center;
          font-size: 17px;
          font-weight: 600;
          border-radius: 2rem;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          height: 2.8em;
          padding-right: 3.3em;
          padding-left: 1rem;
          cursor: pointer;
          transition: background-color 0.4s ease, color 0.4s ease;
        }
        .cssbuttonsIoButton .icon {
          background: white;
          margin-left: 1em;
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 2.2em;
          width: 2.2em;
          border-radius: 2rem;
          right: 0.3em;
          transition: background-position 0.5s ease-out, border 0.2s ease-out, color 0.5s ease-out;
          will-change: width, transform;
        }
        .cssbuttonsIoButton:hover {
          background-color: white;
          color: #000000;
          border: 1px solid #000;
        }
        .cssbuttonsIoButton .icon svg {
          width: 1.1em;
          transition: transform 0.3s ease-out;
          will-change: transform;
          color: #000000;
        }
        .cssbuttonsIoButton:hover .icon svg {
          transform: translateX(0.1em) rotate(-25deg);
        }
        .cssbuttonsIoButton:active .icon {
          transform: scale(0.95);
        }
      `}</style>

      <button
        type="button"
        className="cssbuttonsIoButton"
        aria-label="Your Rights"
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={hovered ? "Open Juri's Rights Guide" : undefined}
      >
        Your Rights
        <span className="icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M5 12H19M13 6L19 12L13 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}

function AppShell() {
  const { theme } = useTheme();
  const tokens = useTokens();
  const location = useLocation();

  const [chatOpen, setChatOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const showSmartBook = location.pathname === "/dashboard";

  return (
    <div
      style={{
        position: "relative",
        background:
          theme === "dark"
            ? "linear-gradient(-45deg, #0a0a0a, #0f0c02, #1c1500, #0a0a0a, #0f0c02)"
            : "linear-gradient(-45deg, #dcdcdc, #c8bfa8, #d6cbb4, #dcdcdc, #c4b99e)",
        backgroundSize: "400% 400%",
        animation: "breathe 12s ease infinite",
        color: tokens.textPrimary,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "color 0.4s ease",
      }}
    >
      <DotBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <InitialHomeRedirect />

        <div style={{ flex: 1 }}>
          <AnimatedRoutes />
        </div>

        <Footer />
      </div>

      <AILawyerBtn
        onPickChat={() => setChatOpen(true)}
      />

      {showSmartBook && (
        <SmartBookBtn
          onOpen={() => setBookOpen(true)}
        />
      )}

      {chatOpen && (
        <JuriChat
          onClose={() => setChatOpen(false)}
        />
      )}

      {bookOpen && showSmartBook && (
        <SmartBook
          onClose={() => setBookOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("legal-theme") || "light"
  );

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("legal-theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme }}
    >
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeContext.Provider>
  );
}