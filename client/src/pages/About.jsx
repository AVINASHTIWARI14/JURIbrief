import { useEffect } from "react";
import { useTokens } from "../App";

const advantages = [
  { icon:"⚡", value:"< 5s", label:"Instant Analysis", desc:"Complete clause breakdown in seconds" },
  { icon:"🔍", value:"Plain English", label:"No Jargon", desc:"Legal terms translated for real people" },
  { icon:"🛡️", value:"Risk Flags", label:"Smart Alerts", desc:"Unfair terms highlighted automatically" },
];
const problemItems = [
  "Rent agreements written to protect landlords",
  "Internship offers with buried non-compete clauses",
  "T&Cs that sign away your IP by default",
];
const fixItems = [
  "Plain-English summaries of every clause",
  "Risk flags with severity levels",
  "Negotiation suggestions you can actually use",
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("sr-on"); });
    }, { threshold:0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function About() {
  const tk = useTokens();
  useReveal();

  return (
    <>
      <style>{`
        .sr { opacity:0; transform:translateY(30px);
          transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
        .sr.sr-on { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.08s} .d2{transition-delay:.16s} .d3{transition-delay:.24s} .d4{transition-delay:.32s}
        .adv-card {
          transition: transform .3s ease, box-shadow .3s ease !important;
        }
        .adv-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 48px rgba(0,0,0,.18) !important;
        }
      `}</style>
      <main style={{ position:"relative", minHeight:"100vh" }}>
        <section style={{
          position:"relative", zIndex:1,
          minHeight:"100vh",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"7rem 1.5rem 5rem",
        }}>
          <div style={{
            width:"100%", maxWidth:"660px",
            margin:"0 auto",
            display:"flex", flexDirection:"column",
            alignItems:"center", textAlign:"center",
            gap:"1.5rem",
          }}>

            {/* Eyebrow */}
            <div className="sr" style={{
              display:"inline-flex", alignItems:"center", gap:"0.5rem",
              background:tk.goldLight,
              border:`1px solid ${tk.goldBorder}`,
              borderRadius:"999px",
              padding:"0.3rem 1rem",
            }}>
              <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:tk.gold, display:"block" }}/>
              <span style={{
                fontFamily:"'Roboto Serif', Georgia, serif",
                fontSize:"0.7rem", letterSpacing:"0.15em",
                textTransform:"uppercase", color:tk.gold,
                fontWeight:600,
              }}>Our Story</span>
            </div>

            {/* H1 */}
            <h1 className="sr d1" style={{
              fontFamily:"'DM Serif Display', Georgia, serif",
              fontWeight:700, color:tk.textPrimary,
              fontSize:"clamp(2.75rem, 6vw, 4.25rem)",
              lineHeight:1.05, letterSpacing:"-0.035em",
              margin:0,
            }}>About Us</h1>

            {/* Subtitle */}
            <p className="sr d2" style={{
              fontFamily:"'Roboto Serif', Georgia, serif",
              fontSize:"1.25rem", fontWeight:500, fontStyle:"italic",
              color:tk.textSecondary,
              maxWidth:"360px", lineHeight:1.65, margin:0,
            }}>
              Built for people who don't have lawyers
            </p>

            {/* Gold rule */}
            <div className="sr" style={{
              width:"48px", height:"1px",
              background:`linear-gradient(90deg, transparent, ${tk.gold}, transparent)`,
            }}/>

            {/* Advantage cards */}
            <div className="sr d2" style={{
              width:"100%",
              display:"grid", gridTemplateColumns:"repeat(3,1fr)",
              gap:"0.875rem",
            }}>
              {advantages.map((a,i)=>(
                <div key={a.label} className="adv-card" style={{
                  background:tk.surface,
                  backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
                  border:`1px solid ${tk.goldBorder}`,
                  borderRadius:"16px",
                  padding:"1.375rem 0.875rem 1.25rem",
                  boxShadow: tk.isDark
                    ? "0 8px 32px rgba(0,0,0,.4)"
                    : "0 4px 24px rgba(0,0,0,.06)",
                  cursor:"default",
                }}>
                  <span style={{ fontSize:"1.375rem", display:"block", marginBottom:"0.625rem" }}>{a.icon}</span>
                  <p style={{
                    fontFamily:"'DM Serif Display', Georgia, serif",
                    fontSize: a.value.length>4 ? "0.9375rem":"1.375rem",
                    fontWeight:700, color:tk.gold,
                    letterSpacing:"-0.02em", lineHeight:1.1, marginBottom:"0.3rem",
                  }}>{a.value}</p>
                  <p style={{
                    fontFamily:"'Roboto Serif', Georgia, serif",
                    fontSize:"0.6875rem", textTransform:"uppercase",
                    letterSpacing:"0.09em", fontWeight:700,
                    color:tk.textSecondary, marginBottom:"0.5rem",
                  }}>{a.label}</p>
                  <p style={{
                    fontFamily:"'Roboto Serif', Georgia, serif",
                    fontSize:"0.9375rem", color:tk.textSecondary, fontWeight:450, lineHeight:1.55,
                  }}>{a.desc}</p>
                </div>
              ))}
            </div>

            {/* Ghost content card */}
            <div className="sr d3" style={{
              width:"100%",
              background:tk.surface,
              backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
              border:`1px solid ${tk.surfaceBorder}`,
              borderRadius:"20px",
              overflow:"hidden",
              boxShadow: tk.isDark
                ? "0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,220,100,.06)"
                : "0 12px 48px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.9)",
              textAlign:"left",
            }}>
              {/* Problem section */}
              <div style={{ padding:"2rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
                  <span style={{ width:"4px", height:"22px", borderRadius:"999px", background:tk.danger, display:"block" }}/>
                  <h2 style={{
                    fontFamily:"'DM Serif Display', Georgia, serif",
                    fontSize:"1rem", fontWeight:700,
                    color:tk.textPrimary, margin:0,
                  }}>The Problem</h2>
                </div>
                <p style={{
                  fontFamily:"'Roboto Serif', Georgia, serif",
                  fontSize:"1.0625rem", color:tk.textSecondary, fontWeight:500, lineHeight:1.7, margin:0,
                }}>
                  Most students and first-jobbers sign documents they've never truly understood.
                  Without a lawyer, you're signing blind.
                </p>
                <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"0.625rem" }}>
                  {problemItems.map(item=>(
                    <li key={item} style={{
                      display:"flex", alignItems:"flex-start", gap:"0.625rem",
                      fontFamily:"'Roboto Serif', Georgia, serif",
                      fontSize:"1rem", color:tk.textSecondary, fontWeight:500,
                    }}>
                      <svg width="14" height="14" fill="none" stroke={tk.danger} viewBox="0 0 24 24" style={{marginTop:"3px",flexShrink:0}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ height:"1px", background:tk.divider }}/>

              {/* Fix section */}
              <div style={{ padding:"2rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
                  <span style={{ width:"4px", height:"22px", borderRadius:"999px", background:tk.success, display:"block" }}/>
                  <h2 style={{
                    fontFamily:"'DM Serif Display', Georgia, serif",
                    fontSize:"1rem", fontWeight:700,
                    color:tk.textPrimary, margin:0,
                  }}>Our Fix</h2>
                </div>
                <p style={{
                  fontFamily:"'Roboto Serif', Georgia, serif",
                  fontSize:"1.0625rem", color:tk.textSecondary, fontWeight:500, lineHeight:1.7, margin:0,
                }}>
                  Legal Ease AI translates legalese into plain English, flags risky clauses,
                  tells you exactly what you're agreeing to, and suggests what to negotiate — in seconds.
                </p>
                <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"0.625rem" }}>
                  {fixItems.map(item=>(
                    <li key={item} style={{
                      display:"flex", alignItems:"flex-start", gap:"0.625rem",
                      fontFamily:"'Roboto Serif', Georgia, serif",
                      fontSize:"1rem", color:tk.textSecondary, fontWeight:500,
                    }}>
                      <svg width="14" height="14" fill="none" stroke={tk.success} viewBox="0 0 24 24" style={{marginTop:"3px",flexShrink:0}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <a className="sr d4" href="/" style={{
              fontFamily:"'Roboto Serif', Georgia, serif",
              fontSize:"1.0625rem", fontWeight:600,
              color:tk.gold,
              textDecoration:"none",
              display:"inline-flex", alignItems:"center", gap:"0.375rem",
              padding:"0.5rem 1.25rem",
              border:`1px solid ${tk.goldBorder}`,
              borderRadius:"999px",
              background:tk.goldLight,
              transition:"all .25s",
              letterSpacing:"0.02em",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background=tk.isDark?"rgba(201,168,76,0.2)":"rgba(160,120,40,0.15)"; e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=tk.goldLight; e.currentTarget.style.transform="translateY(0)";}}
            >
              Try it free — no account needed
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}