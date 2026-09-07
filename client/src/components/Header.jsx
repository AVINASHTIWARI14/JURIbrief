import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme, useTokens } from "../App";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";

export default function Header() {
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

  const GITHUB_REPO = "https://github.com/AVINASHTIWARI14/legal-ease-ai";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const hBg = scrolled
    ? (tk.isDark ? "rgba(10,10,10,0.97)" : "rgba(185,178,165,0.97)")
    : (tk.isDark ? "rgba(10,10,10,0.80)" : "rgba(185,178,165,0.88)");

  const responsiveStyles = `
    .juri-header-inner {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
    }

    .juri-header-nav,
    .juri-header-actions,
    .juri-user-actions {
      min-width: 0;
    }

    .juri-header-nav {
      flex-wrap: nowrap;
      white-space: nowrap;
    }

    .juri-header-nav a {
      flex: 0 0 auto;
    }

    .juri-header-actions {
      flex-wrap: nowrap;
      overflow: hidden;
    }

    .juri-user-actions {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .juri-github-button {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    @media (max-width: 1100px) {
      .juri-header-inner {
        grid-template-columns: minmax(130px, 0.8fr) auto minmax(390px, 1fr) !important;
        gap: 0.6rem !important;
        padding: 0 1rem !important;
      }

      .juri-header-nav {
        gap: 1.2rem !important;
      }

      .juri-header-actions {
        gap: 0.55rem !important;
      }

      .juri-github-button {
        height: 34px !important;
        padding: 0 0.55rem !important;
      }

      .juri-github-button span span {
        display: none;
      }
    }

    @media (max-width: 900px) {
      .juri-header-inner {
        height: auto !important;
        min-height: 62px;
        grid-template-columns: minmax(0, 1fr) auto !important;
        gap: 0.6rem !important;
        padding: 0.55rem 0.8rem !important;
      }

      .juri-header-inner > a {
        min-width: 0;
        overflow: hidden;
      }

      .juri-header-nav {
        grid-column: 1 / -1;
        grid-row: 2;
        justify-content: center;
        gap: 1rem !important;
        padding: 0.25rem 0 0.35rem;
        flex-wrap: wrap;
        white-space: normal;
      }

      .juri-header-nav a {
        font-size: 0.86rem !important;
      }

      .juri-header-actions {
        justify-content: flex-end !important;
        gap: 0.45rem !important;
        overflow: visible;
      }

      .juri-user-actions {
        gap: 0.4rem !important;
      }

      .juri-github-button {
        height: 34px !important;
        width: 34px !important;
        padding: 0 !important;
      }

      .juri-github-button span span {
        display: none;
      }

      .juri-github-button svg {
        width: 17px !important;
        height: 17px !important;
      }
    }

    @media (max-width: 520px) {
      .juri-header-inner {
        grid-template-columns: minmax(0, 1fr) auto !important;
        padding: 0.5rem 0.65rem !important;
      }

      .juri-header-nav {
        gap: 0.75rem !important;
        padding-top: 0.2rem;
      }

      .juri-header-nav a {
        font-size: 0.78rem !important;
        letter-spacing: 0.02em !important;
      }

      .juri-header-actions {
        gap: 0.3rem !important;
      }

      .juri-user-actions {
        gap: 0.3rem !important;
      }

      .juri-user-actions a {
        width: 34px !important;
        height: 34px !important;
        min-width: 34px !important;
        padding: 0 !important;
      }

      .juri-user-actions button {
        padding: 0.35rem 0.55rem !important;
        font-size: 0.72rem !important;
      }

      .juri-github-button {
        width: 34px !important;
        min-width: 34px !important;
      }
    }

    @media (max-width: 380px) {
      .juri-header-nav {
        gap: 0.55rem !important;
      }

      .juri-header-nav a {
        font-size: 0.72rem !important;
      }

      .juri-user-actions button {
        padding: 0.3rem 0.45rem !important;
        font-size: 0.68rem !important;
      }

      .juri-user-actions a {
        width: 32px !important;
        height: 32px !important;
        min-width: 32px !important;
      }

      .juri-github-button {
        width: 32px !important;
        min-width: 32px !important;
        height: 32px !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <header
      className="juri-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: hBg,
        borderBottom: `1px solid ${tk.surfaceBorder}`,
        transition: "background-color 0.35s ease",
      }}
    >
      <div
        className="juri-header-inner"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "62px",
          display: "grid",
          gridTemplateColumns: "minmax(160px, 1fr) auto minmax(430px, 1fr)",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <BrandLogo size="normal" />
        </Link>

        {/* Nav links */}
        <nav
          className="juri-header-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.25rem",
          }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontFamily: "'Roboto Serif', Georgia, serif",
                  fontSize: "1rem",
                  fontWeight: active ? 600 : 500,
                  letterSpacing: "0.04em",
                  color: active ? tk.gold : tk.textSecondary,
                  textDecoration: "none",
                  position: "relative",
                  paddingBottom: "2px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = tk.gold; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = active ? tk.gold : tk.textSecondary;
                }}
              >
                {link.label}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "1px",
                      borderRadius: "999px",
                      background: `linear-gradient(90deg, transparent, ${tk.gold}, transparent)`,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div
          className="juri-header-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            width: "100%",
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={tk.isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width:"60px", height:"30px", borderRadius:"15px", border:"none",
              cursor:"pointer", position:"relative", padding:0, overflow:"hidden",
              background:tk.isDark
                ? "linear-gradient(135deg,#0d1b3e 0%,#1a1a3e 100%)"
                : "linear-gradient(135deg,#5bc8f5 0%,#87d8f7 100%)",
              boxShadow:tk.isDark
                ? "0 0 0 1px rgba(100,130,220,.3), inset 0 1px 0 rgba(255,255,255,.05)"
                : "0 0 0 1px rgba(80,180,240,.4), inset 0 1px 0 rgba(255,255,255,.5)",
              transition:"background .4s ease, box-shadow .3s ease",
            }}
          >
            {[
              {t:"5px",l:"8px",s:"2px"},{t:"13px",l:"14px",s:"1.5px"},
              {t:"7px",l:"22px",s:"1.5px"},{t:"16px",l:"6px",s:"1px"}
            ].map((star,i)=>(
              <span key={i} style={{
                position:"absolute",top:star.t,left:star.l,width:star.s,height:star.s,
                borderRadius:"50%",background:"white",opacity:tk.isDark?.85:0,
                transition:"opacity .4s ease",pointerEvents:"none"
              }}/>
            ))}
            <span style={{
              position:"absolute",top:"9px",right:"9px",width:"16px",height:"8px",
              background:"rgba(255,255,255,.8)",borderRadius:"10px",
              boxShadow:"-5px 2px 0 -1px rgba(255,255,255,.7)",
              opacity:tk.isDark?0:1,transition:"opacity .4s ease",pointerEvents:"none"
            }}/>
            <span style={{
              position:"absolute",top:"3px",left:tk.isDark?"33px":"3px",width:"24px",height:"24px",
              borderRadius:"50%",
              background:tk.isDark
                ?"linear-gradient(145deg,#e8eaf6 0%,#c5cae9 100%)"
                :"linear-gradient(145deg,#ffd740 0%,#ffab00 100%)",
              boxShadow:tk.isDark
                ?"inset -3px -1px 0 rgba(120,140,200,.55)"
                :"0 0 8px rgba(255,200,0,.55),0 0 18px rgba(255,180,0,.25)",
              transition:"left .4s cubic-bezier(.34,1.56,.64,1), background .4s ease, box-shadow .4s ease",
              pointerEvents:"none",zIndex:2
            }}/>
          </button>

          {/* User / Login */}
          {user ? (
            <div className="juri-user-actions" style={{display:"flex",alignItems:"center",gap:"0.85rem"}}>
              <Link
                to="/dashboard"
                title={displayName ? `Signed in as ${displayName}` : "Open dashboard"}
                aria-label={displayName ? `Open dashboard for ${displayName}` : "Open dashboard"}
                style={{
                  width:"38px",height:"38px",minWidth:"38px",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxSizing:"border-box",
                  fontFamily:"'Roboto Serif', Georgia, serif",fontSize:"0.95rem",
                  fontWeight:700,background:tk.goldLight,color:tk.gold,
                  border:`1px solid ${tk.goldBorder}`,
                  borderRadius:"50%",textDecoration:"none",
                  letterSpacing:"0",textTransform:"uppercase",
                  transition:"opacity .2s, transform .2s",
                  flexShrink:0,
                }}
                onMouseEnter={(e)=>{e.currentTarget.style.opacity=".78";e.currentTarget.style.transform="scale(1.05)"}}
                onMouseLeave={(e)=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="scale(1)"}}
              >
                {(displayName || "U").trim().charAt(0).toUpperCase()}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontFamily:"'Roboto Serif', Georgia, serif",fontSize:"0.875rem",
                  fontWeight:500,background:"transparent",
                  border:`1px solid ${tk.surfaceBorder}`,color:tk.textMuted,
                  padding:"0.4rem 0.75rem",borderRadius:"8px",cursor:"pointer",
                  transition:"all .2s"
                }}
                onMouseEnter={(e)=>{e.currentTarget.style.borderColor="#e05252";e.currentTarget.style.color="#e05252"}}
                onMouseLeave={(e)=>{e.currentTarget.style.borderColor=tk.surfaceBorder;e.currentTarget.style.color=tk.textMuted}}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              style={{
                fontFamily:"'Roboto Serif', Georgia, serif",fontSize:"0.9375rem",
                fontWeight:600,background:tk.btnBg,color:tk.btnText,
                padding:"0.4rem 1.125rem",borderRadius:"8px",textDecoration:"none",
                letterSpacing:"0.04em",transition:"opacity .2s"
              }}
              onMouseEnter={(e)=>{e.currentTarget.style.opacity=".78"}}
              onMouseLeave={(e)=>{e.currentTarget.style.opacity="1"}}
            >
              Login
            </Link>
          )}

          {/* GitHub Star */}
          <a
            className="juri-github-button"
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            title="Open JURIbrief GitHub repository"
            aria-label="Open JURIbrief GitHub repository"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "38px",
              padding: "0 0.7rem",
              borderRadius: "10px",
              textDecoration: "none",
              color: "#fff",
              overflow: "visible",
              cursor: "pointer",
              border: "0.08rem solid transparent",
              backgroundImage:
                "linear-gradient(#121213,#121213), linear-gradient(#121213 50%,rgba(18,18,19,.6) 80%,rgba(18,18,19,0)), linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))",
              backgroundSize: "100%,100%,200%",
              backgroundClip: "padding-box,border-box,border-box",
              backgroundOrigin: "border-box",
              transition: "transform .2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(.95)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.16c-3.22.7-3.9-1.55-3.9-1.55-.53-1.38-1.29-1.75-1.29-1.75-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.57-.29-5.27-1.29-5.27-5.74 0-1.27.45-2.31 1.19-3.12-.12-.29-.52-1.48.11-3.08 0 0 .97-.31 3.17 1.19A11 11 0 0 1 12 5.4c.98 0 1.96.13 2.88.38 2.2-1.5 3.17-1.19 3.17-1.19.63 1.6.23 2.79.11 3.08.74.81 1.19 1.85 1.19 3.12 0 4.46-2.71 5.44-5.29 5.73.41.36.78 1.08.78 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
              </svg>
              <span>Star on GitHub</span>
            </span>
          </a>

        </div>
      </div>
      </header>
    </>
  );
}
