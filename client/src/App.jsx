import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
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
export function useTheme() { return useContext(ThemeContext); }

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
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background wash (face warm tone fills whole circle) */}
      <rect width="48" height="48" fill={skin}/>

      {/* Back / side hair — covers the top & frames the sides */}
      <path d="M0 24 Q0 4 24 2 Q48 4 48 24 L48 48 L38 48 Q38 34 36 24 Q30 18 24 18 Q18 18 12 24 Q10 34 10 48 L0 48 Z" fill={hair}/>

      {/* Face oval (covers a bit of the back hair so face reads clean) */}
      <ellipse cx="24" cy="27" rx="14" ry="15" fill={skin}/>

      {/* Hair fringe / bangs */}
      <path d="M10 20 Q12 10 24 8 Q36 10 38 20 Q34 14 28 16 Q24 13 20 16 Q14 14 10 20 Z" fill={hair}/>
      <path d="M11 20 Q17 16 24 18 Q31 16 37 20" stroke={hairLight} strokeWidth="0.6" fill="none" opacity="0.7"/>

      {/* Subtle chin shading */}
      <path d="M14 36 Q24 44 34 36" stroke={skinShade} strokeWidth="0.6" fill="none" opacity="0.4"/>

      {/* Eyebrows */}
      {smiling ? (
        <>
          <path d="M14.5 22 Q18 20.5 21 22" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          <path d="M27 22 Q30 20.5 33.5 22" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M15 23 Q18 22 21 23" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          <path d="M27 23 Q30 22 33 23" stroke={hair} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        </>
      )}

      {/* Eyes */}
      {smiling ? (
        // Happy / squinted curved arcs
        <>
          <path d="M15 27 Q18 24.5 21 27" stroke={feature} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M27 27 Q30 24.5 33 27" stroke={feature} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        // Neutral — filled ovals with tiny highlight
        <>
          <ellipse cx="18.5" cy="27" rx="1.4" ry="1.9" fill={feature}/>
          <ellipse cx="29.5" cy="27" rx="1.4" ry="1.9" fill={feature}/>
          <circle cx="18.9" cy="26.4" r="0.45" fill="#fff"/>
          <circle cx="29.9" cy="26.4" r="0.45" fill="#fff"/>
        </>
      )}

      {/* Nose hint */}
      <path d="M24 29 Q23 32 24.4 33" stroke={skinShade} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.75"/>

      {/* Cheek blush (always on, stronger when smiling) */}
      <circle cx="14.5" cy="33" r={smiling ? "2.4" : "1.6"} fill={blush} opacity={smiling ? 0.9 : 0.5}/>
      <circle cx="33.5" cy="33" r={smiling ? "2.4" : "1.6"} fill={blush} opacity={smiling ? 0.9 : 0.5}/>

      {/* Mouth */}
      {smiling ? (
        <path d="M18 36 Q24 42 30 36" stroke={lips} strokeWidth="2" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M20 36 Q24 37.5 28 36" stroke={lips} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      )}

      {/* Gold earrings */}
      <circle cx="7.5" cy="30" r="1.2" fill="#c9a84c"/>
      <circle cx="40.5" cy="30" r="1.2" fill="#c9a84c"/>
    </svg>
  );
}

function AILawyerBtn({ onPickGuide, onPickChat }) {
  const tk = useTokens();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    const t = setTimeout(() => window.addEventListener("click", close, { once: true }), 50);
    return () => { clearTimeout(t); window.removeEventListener("click", close); };
  }, [menuOpen]);

  const menuItem = (icon, title, subtitle, onClick) => (
    <button
      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick(); }}
      style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        width: "100%", padding: "0.75rem 0.9rem",
        background: "transparent", border: "none",
        borderRadius: "10px", cursor: "pointer", textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = tk.goldLight}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700, fontSize: "0.9rem", color: tk.textPrimary }}>{title}</div>
        <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.75rem", color: tk.textMuted, marginTop: "2px" }}>{subtitle}</div>
      </div>
    </button>
  );

  return (
    <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999 }}>
      {/* Hover tooltip */}
      <div style={{
        position: "absolute", bottom: "calc(100% + 0.75rem)", right: 0,
        background: tk.isDark ? "rgba(22,20,18,0.97)" : "rgba(255,254,252,0.97)",
        border: `1px solid ${tk.goldBorder}`, borderRadius: "12px",
        padding: "0.5rem 0.875rem",
        boxShadow: tk.isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)",
        whiteSpace: "nowrap",
        fontFamily: "'Roboto Serif', Georgia, serif",
        fontSize: "0.8125rem", color: tk.textSecondary,
        pointerEvents: "none",
        opacity: hovered && !menuOpen ? 1 : 0,
        transform: hovered && !menuOpen ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}>
        Stuck? <span style={{ color: tk.gold, fontWeight: 600 }}>Juri</span> is here to help
        <div style={{ position: "absolute", bottom: "-5px", right: "18px", width: "10px", height: "10px", background: tk.isDark ? "rgba(22,20,18,0.97)" : "rgba(255,254,252,0.97)", border: `1px solid ${tk.goldBorder}`, borderTop: "none", borderLeft: "none", transform: "rotate(45deg)", borderRadius: "0 0 2px 0" }}/>
      </div>

      {/* Choice menu */}
      {menuOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", bottom: "calc(100% + 0.75rem)", right: 0,
            width: "260px",
            background: tk.isDark ? "rgba(22,20,18,0.98)" : "rgba(255,254,252,0.98)",
            border: `1px solid ${tk.goldBorder}`, borderRadius: "14px",
            padding: "0.4rem",
            boxShadow: tk.isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 10px 40px rgba(0,0,0,0.12)",
            animation: "menuIn 0.2s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <style>{`@keyframes menuIn { from { opacity: 0; transform: translateY(6px) scale(.97) } to { opacity: 1; transform: none } }`}</style>
          {menuItem("📘", "How to use Legal Ease AI", "Quick platform guide", onPickGuide)}
          {menuItem("💬", "Ask Juri", "Chat about your document", onPickChat)}
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "68px", height: "68px", borderRadius: "50%",
          background: menuOpen
            ? `linear-gradient(135deg, ${tk.gold}, #a07830)`
            : (tk.isDark ? "#fdf5e8" : "#fff8ec"),
          border: `2px solid ${menuOpen ? tk.gold : tk.goldBorder}`,
          overflow: "hidden",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: hovered || menuOpen
            ? (tk.isDark ? "0 0 0 8px rgba(201,168,76,0.12), 0 12px 32px rgba(0,0,0,0.5)" : "0 0 0 8px rgba(201,168,76,0.18), 0 12px 32px rgba(0,0,0,0.15)")
            : (tk.isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.12)"),
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
          padding: 0,
          color: menuOpen ? "#fff" : undefined,
        }}
      >
        {menuOpen ? (
          <span style={{ fontSize: "1.4rem", fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700 }}>✕</span>
        ) : (
          <JuriFace size={68} smiling={hovered} />
        )}
      </button>
    </div>
  );
}

function HowItWorksOverlay({ onClose }) {
  const tk = useTokens();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: tk.isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}/>
      <div style={{
        position: "relative", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto",
        background: tk.isDark ? "rgba(14,14,12,0.98)" : "rgba(253,251,248,0.98)",
        border: `1px solid ${tk.goldBorder}`, borderRadius: "24px", padding: "2.5rem",
        boxShadow: tk.isDark ? "0 40px 120px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,220,100,0.08)" : "0 40px 120px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
        animation: "overlayIn 0.35s cubic-bezier(.22,1,.36,1)",
      }}>
        <style>{`@keyframes overlayIn { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:none} }`}</style>
        <button onClick={onClose} style={{ position: "absolute", top: "1.25rem", left: "1.25rem", display: "flex", alignItems: "center", gap: "0.375rem", background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, borderRadius: "8px", padding: "0.375rem 0.75rem", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8125rem", fontWeight: 600, color: tk.gold, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = tk.isDark ? "rgba(201,168,76,0.2)" : "rgba(160,120,40,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = tk.goldLight; }}>
          ← Back
        </button>
        <div style={{ paddingTop: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: tk.goldLight, border: `2px solid ${tk.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <JuriFace size={56} smiling />
              </div>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700, fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: tk.textPrimary, letterSpacing: "-0.03em", margin: "0 0 0.5rem" }}>Your AI Lawyer</h2>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", color: tk.textSecondary, fontSize: "1.125rem", fontWeight: 300, fontStyle: "italic", margin: 0 }}>Making legal documents accessible to everyone</p>
          </div>
          <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${tk.gold}, transparent)`, marginBottom: "2rem" }}/>
          <section style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.125rem", fontWeight: 700, color: tk.textPrimary, margin: "0 0 0.75rem" }}>What is Legal Ease AI?</h3>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1.0625rem", color: tk.textSecondary, lineHeight: 1.75, margin: 0 }}>
              Legal Ease AI is an intelligent document analysis tool that translates complex legal language into plain, understandable English. Whether reviewing a rental agreement, employment contract, terms of service, or any other legal document — we have you covered.
            </p>
          </section>
          <section style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.125rem", fontWeight: 700, color: tk.textPrimary, margin: "0 0 1rem" }}>How to Use</h3>
            {[
              { step: "01", title: "Paste or Upload", desc: "Paste your legal text directly or upload a PDF/DOC file from your device." },
              { step: "02", title: "One-Click Analysis", desc: "Hit Analyse Document and our AI processes every clause in seconds." },
              { step: "03", title: "Read Plain-English Results", desc: "Get a clear summary, risk flags with severity levels, and what you are actually agreeing to." },
              { step: "04", title: "Know What to Negotiate", desc: "Receive actionable suggestions on clauses you should push back on." },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", gap: "1rem", marginBottom: "1rem", padding: "1rem", borderRadius: "12px", background: tk.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", border: `1px solid ${tk.surfaceBorder}` }}>
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.75rem", fontWeight: 700, color: tk.gold, letterSpacing: "0.08em", opacity: 0.8, flexShrink: 0, marginTop: "2px" }}>{item.step}</span>
                <div>
                  <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontWeight: 600, fontSize: "1rem", color: tk.textPrimary, margin: "0 0 0.25rem" }}>{item.title}</p>
                  <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", color: tk.textSecondary, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </section>
          <div style={{ background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>🔒</span>
            <div>
              <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", fontWeight: 600, color: tk.gold, margin: "0 0 0.25rem" }}>Your Privacy Matters</p>
              <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", color: tk.textSecondary, lineHeight: 1.6, margin: 0 }}>Documents are never stored. All analysis happens in real-time and nothing is retained after your session ends.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: "100%", marginTop: "1.5rem", padding: "0.875rem", borderRadius: "12px", fontFamily: "'Roboto Serif', Georgia, serif", fontWeight: 600, fontSize: "1rem", letterSpacing: "0.04em", border: "none", cursor: "pointer", background: tk.btnBg, color: tk.btnText, transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Start Analysing →
          </button>
        </div>
      </div>
    </div>
  );
}

export function useTokens() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return {
    isDark,
    bg: isDark ? "#0a0a0a" : "#dcdcdc",
    surface: isDark ? "rgba(22,20,18,0.88)" : "rgba(218,212,200,0.90)",
    surfaceBorder: isDark ? "rgba(255,220,100,0.10)" : "rgba(160,120,40,0.15)",
    gold: isDark ? "#c9a84c" : "#a07830",
    goldLight: isDark ? "rgba(201,168,76,0.12)" : "rgba(160,120,40,0.09)",
    goldBorder: isDark ? "rgba(201,168,76,0.25)" : "rgba(160,120,40,0.22)",
    textPrimary: isDark ? "#f2eed8" : "#1a160c",
    textSecondary: isDark ? "rgba(242,238,216,0.72)" : "rgba(26,22,12,0.68)",
    textMuted: isDark ? "rgba(242,238,216,0.48)" : "rgba(26,22,12,0.42)",
    inputBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
    inputBorder: isDark ? "rgba(255,220,100,0.14)" : "rgba(160,120,40,0.16)",
    divider: isDark ? "rgba(255,220,100,0.08)" : "rgba(160,120,40,0.10)",
    btnBg: isDark ? "#c9a84c" : "#1a160c",
    btnText: isDark ? "#0e0e0f" : "#f9f7f4",
    danger: "#e05252",
    success: "#3da87a",
  };
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/waitlist" element={<PageWrapper><Waitlist /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/dashboard" element={
          <PageWrapper><ProtectedRoute><Dashboard /></ProtectedRoute></PageWrapper>
        } />
        <Route path="/admin" element={
          <PageWrapper><ProtectedRoute adminOnly><Admin /></ProtectedRoute></PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function SmartBookBtn({ onOpen }) {
  const tk = useTokens();
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: "2rem", left: "2rem", zIndex: 9999 }}>
      <div style={{
        position: "absolute", bottom: "calc(100% + 0.75rem)", left: 0,
        background: tk.isDark ? "rgba(22,20,18,0.97)" : "rgba(255,254,252,0.97)",
        border: `1px solid ${tk.goldBorder}`, borderRadius: "12px",
        padding: "0.5rem 0.875rem",
        boxShadow: tk.isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)",
        whiteSpace: "nowrap",
        fontFamily: "'Roboto Serif', Georgia, serif",
        fontSize: "0.8125rem", color: tk.textSecondary,
        pointerEvents: "none",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}>
        <span style={{ color: tk.gold, fontWeight: 600 }}>Know Your Rights</span>{" — "}quick guide
        <div style={{ position: "absolute", bottom: "-5px", left: "18px", width: "10px", height: "10px", background: tk.isDark ? "rgba(22,20,18,0.97)" : "rgba(255,254,252,0.97)", border: `1px solid ${tk.goldBorder}`, borderTop: "none", borderLeft: "none", transform: "rotate(45deg)", borderRadius: "0 0 2px 0" }}/>
      </div>
      <button
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          filter: hovered
            ? `drop-shadow(0 6px 16px ${tk.isDark ? "rgba(201,168,76,0.4)" : "rgba(160,120,40,0.35)"})`
            : `drop-shadow(0 3px 8px ${tk.isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)"})`,
          transform: hovered ? "scale(1.12) rotate(-4deg) translateY(-2px)" : "scale(1)",
          transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 3D closed book — isometric */}
          {/* Pages stack (cream) — bottom-right */}
          <path d="M 4 11 L 27 8 L 29.5 10 L 29.5 22 L 27 24 L 6.5 26.5 Z" fill={tk.isDark ? "#f0e4c8" : "#e8dcb4"}/>
          <line x1="27.3" y1="12" x2="29.2" y2="11" stroke="#a07830" strokeWidth="0.4" opacity="0.6"/>
          <line x1="27.3" y1="15" x2="29.2" y2="14" stroke="#a07830" strokeWidth="0.4" opacity="0.6"/>
          <line x1="27.3" y1="18" x2="29.2" y2="17" stroke="#a07830" strokeWidth="0.4" opacity="0.6"/>
          <line x1="27.3" y1="21" x2="29.2" y2="20" stroke="#a07830" strokeWidth="0.4" opacity="0.6"/>

          {/* Top face of cover (dark) */}
          <path d="M 3 9 L 26 6 L 28.5 8 L 5.5 11 Z" fill={tk.isDark ? "#0d0a05" : "#1a140a"}/>
          {/* Front face of cover (dark) */}
          <path d="M 5.5 11 L 28.5 8 L 28.5 21 L 5.5 24 Z" fill={tk.isDark ? "#1a140a" : "#2a1f0e"}/>
          {/* Cover top-edge highlight */}
          <path d="M 3 9 L 26 6" stroke={tk.gold} strokeWidth="0.4" opacity="0.7"/>

          {/* Scales of justice on cover */}
          <g transform="translate(17 16) rotate(-6)">
            <circle cx="0" cy="-2.3" r="2.2" stroke={tk.gold} strokeWidth="0.35" opacity="0.4" fill="none"/>
            <line x1="-3.2" y1="-2.3" x2="3.2" y2="-2.3" stroke={tk.gold} strokeWidth="0.8" strokeLinecap="round"/>
            <circle cx="0" cy="-2.3" r="1.1" fill="#e8c96a"/>
            <line x1="0" y1="-1.3" x2="0" y2="3" stroke={tk.gold} strokeWidth="0.8" strokeLinecap="round"/>
            <line x1="-2" y1="3" x2="2" y2="3" stroke={tk.gold} strokeWidth="1" strokeLinecap="round"/>
            <path d="M -4.3 -1.3 Q -3.2 0.3 -2.1 -1.3" stroke={tk.gold} strokeWidth="0.55" fill="none" strokeLinecap="round"/>
            <path d="M 2.1 -1.3 Q 3.2 0.3 4.3 -1.3" stroke={tk.gold} strokeWidth="0.55" fill="none" strokeLinecap="round"/>
          </g>

          {/* Bookmark ribbon hanging */}
          <path d="M 24 6.4 L 24.6 11 L 25.3 10 L 26 11 L 25.3 6.2 Z" fill={tk.gold} opacity="0.95"/>
        </svg>
      </button>
    </div>
  );
}

function AppShell() {
  const { theme } = useTheme();
  const tokens = useTokens();
  const location = useLocation();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const showSmartBook = location.pathname === "/dashboard";
  return (
    <div style={{
      position: "relative",
      background: theme === "dark"
        ? "linear-gradient(-45deg, #0a0a0a, #0f0c02, #1c1500, #0a0a0a, #0f0c02)"
        : "linear-gradient(-45deg, #dcdcdc, #c8bfa8, #d6cbb4, #dcdcdc, #c4b99e)",
      backgroundSize: "400% 400%",
      animation: "breathe 12s ease infinite",
      color: tokens.textPrimary,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      transition: "color 0.4s ease",
    }}>
      <DotBackground />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <div style={{ flex: 1 }}>
          <AnimatedRoutes />
        </div>
        <Footer />
      </div>
      <AILawyerBtn
        onPickGuide={() => setOverlayOpen(true)}
        onPickChat={() => setChatOpen(true)}
      />
      {showSmartBook && <SmartBookBtn onOpen={() => setBookOpen(true)} />}
      {overlayOpen && <HowItWorksOverlay onClose={() => setOverlayOpen(false)} />}
      {chatOpen && <JuriChat onClose={() => setChatOpen(false)} />}
      {bookOpen && showSmartBook && <SmartBook onClose={() => setBookOpen(false)} />}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("legal-theme") || "light");
  const toggleTheme = () => {
    setTheme(prev => { const next = prev === "light" ? "dark" : "light"; localStorage.setItem("legal-theme", next); return next; });
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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