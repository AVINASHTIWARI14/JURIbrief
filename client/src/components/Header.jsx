import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme, useTokens } from "../App";
import { useAuth } from "../context/AuthContext";
import LogoMark from "./LogoMark";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const tk = useTokens();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "";

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const hBg = scrolled || menuOpen
    ? (tk.isDark ? "rgba(10,10,10,0.97)" : "rgba(185,178,165,0.97)")
    : (tk.isDark ? "rgba(10,10,10,0.80)" : "rgba(185,178,165,0.88)");

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: hBg, borderBottom: `1px solid ${tk.surfaceBorder}`,
        transition: "background-color 0.35s ease",
      }}
    >
      <div
        style={{
          maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem",
          height: "62px", display: "grid",
          gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", transition: "opacity 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <LogoMark size={34} isDark={tk.isDark} />
          <span style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 400, fontSize: "1.075rem", letterSpacing: "0.04em",
            color: tk.isDark ? "#f2eed8" : "#1a160c",
          }}>
            Legal Ease AI
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2.25rem" }}>
          {navLinks.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to} to={link.to}
                style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", fontWeight: active ? 600 : 500, letterSpacing: "0.04em", color: active ? tk.gold : tk.textSecondary, textDecoration: "none", position: "relative", paddingBottom: "2px", transition: "color 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = tk.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = active ? tk.gold : tk.textSecondary; }}
              >
                {link.label}
                {active && (
                  <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", borderRadius: "999px", background: `linear-gradient(90deg, transparent, ${tk.gold}, transparent)` }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.625rem" }}>

          {/* Theme toggle — scenic pill */}
          <button
            onClick={toggleTheme}
            title={tk.isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: "60px", height: "30px", borderRadius: "15px", border: "none",
              cursor: "pointer", position: "relative", padding: 0, overflow: "hidden",
              background: tk.isDark
                ? "linear-gradient(135deg, #0d1b3e 0%, #1a1a3e 100%)"
                : "linear-gradient(135deg, #5bc8f5 0%, #87d8f7 100%)",
              boxShadow: tk.isDark
                ? "0 0 0 1px rgba(100,130,220,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 0 0 1px rgba(80,180,240,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
              transition: "background 0.4s ease, box-shadow 0.3s ease",
            }}
          >
            {/* Stars (dark mode) */}
            {[{t:"5px",l:"8px",s:"2px"},{t:"13px",l:"14px",s:"1.5px"},{t:"7px",l:"22px",s:"1.5px"},{t:"16px",l:"6px",s:"1px"}].map((star,i) => (
              <span key={i} style={{
                position:"absolute", top:star.t, left:star.l,
                width:star.s, height:star.s, borderRadius:"50%",
                background:"white",
                opacity: tk.isDark ? 0.85 : 0,
                transition: "opacity 0.4s ease",
                pointerEvents:"none",
              }}/>
            ))}
            {/* Cloud puffs (light mode) */}
            <span style={{
              position:"absolute", top:"9px", right:"9px",
              width:"16px", height:"8px",
              background:"rgba(255,255,255,0.8)",
              borderRadius:"10px",
              boxShadow: "-5px 2px 0 -1px rgba(255,255,255,0.7)",
              opacity: tk.isDark ? 0 : 1,
              transition: "opacity 0.4s ease",
              pointerEvents:"none",
            }}/>
            {/* Sliding knob */}
            <span style={{
              position:"absolute", top:"3px",
              left: tk.isDark ? "33px" : "3px",
              width:"24px", height:"24px", borderRadius:"50%",
              background: tk.isDark
                ? "linear-gradient(145deg, #e8eaf6 0%, #c5cae9 100%)"
                : "linear-gradient(145deg, #ffd740 0%, #ffab00 100%)",
              boxShadow: tk.isDark
                ? "inset -3px -1px 0 rgba(120,140,200,0.55)"
                : "0 0 8px rgba(255,200,0,0.55), 0 0 18px rgba(255,180,0,0.25)",
              transition: "left 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.4s ease, box-shadow 0.4s ease",
              pointerEvents:"none",
              zIndex: 2,
            }}/>
          </button>

          {/* User / login */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link
                to="/dashboard"
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", fontWeight: 600, background: tk.goldLight, color: tk.gold, border: `1px solid ${tk.goldBorder}`, padding: "0.4rem 1rem", borderRadius: "8px", textDecoration: "none", letterSpacing: "0.03em", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                {displayName}
              </Link>
              <button
                onClick={handleLogout}
                style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", fontWeight: 500, background: "transparent", border: `1px solid ${tk.surfaceBorder}`, color: tk.textMuted, padding: "0.4rem 0.75rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e05252"; e.currentTarget.style.color = "#e05252"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.surfaceBorder; e.currentTarget.style.color = tk.textMuted; }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9375rem", fontWeight: 600, background: tk.btnBg, color: tk.btnText, padding: "0.4rem 1.125rem", borderRadius: "8px", textDecoration: "none", letterSpacing: "0.04em", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.78"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Login
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ padding: "4px", color: tk.textPrimary, background: "transparent", border: "none", cursor: "pointer" }}>
            <div style={{ width: "20px", display: "flex", flexDirection: "column", gap: "5px" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ display: "block", height: "1.5px", background: "currentColor", borderRadius: "2px", transition: "all 0.2s", transform: menuOpen && i === 0 ? "rotate(45deg) translateY(6.5px)" : menuOpen && i === 2 ? "rotate(-45deg) translateY(-6.5px)" : "none", opacity: menuOpen && i === 1 ? 0 : 1, width: i === 1 ? "13px" : "20px" }} />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: `1px solid ${tk.surfaceBorder}`, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", background: tk.isDark ? "rgba(10,10,10,0.98)" : "rgba(185,178,165,0.98)" }}>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1.125rem", fontWeight: 600, color: pathname === link.to ? tk.gold : tk.textSecondary, textDecoration: "none" }}>
              {link.label}
            </Link>
          ))}
          <div style={{ paddingTop: "0.5rem", borderTop: `1px solid ${tk.surfaceBorder}` }}>
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Link to="/dashboard" style={{ display: "block", textAlign: "center", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", fontWeight: 600, background: tk.goldLight, color: tk.gold, border: `1px solid ${tk.goldBorder}`, padding: "0.6rem 1rem", borderRadius: "8px", textDecoration: "none" }}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", fontWeight: 600, background: "transparent", border: "1px solid rgba(224,82,82,0.4)", color: "#e05252", padding: "0.6rem 1rem", borderRadius: "8px", cursor: "pointer", width: "100%" }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" style={{ display: "block", textAlign: "center", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", fontWeight: 600, background: tk.btnBg, color: tk.btnText, padding: "0.6rem 1rem", borderRadius: "8px", textDecoration: "none" }}>
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}