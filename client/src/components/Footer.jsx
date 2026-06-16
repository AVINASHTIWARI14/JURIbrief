import { Link } from "react-router-dom";
import { useTokens } from "../App";
import LogoMark from "./LogoMark";


export default function Footer() {
  const tk = useTokens();
  return (
    <footer style={{
      borderTop:`1px solid ${tk.surfaceBorder}`,
      padding:"1.75rem 1.5rem",
      background: tk.isDark?"#0e0e0e":"#b9b2a5",
    }}>
      <div style={{
        maxWidth:"72rem", margin:"0 auto",
        display:"flex", flexWrap:"wrap",
        alignItems:"center", justifyContent:"space-between", gap:"1rem",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <LogoMark size={22} isDark={tk.isDark}/>
          <span style={{
            fontFamily:"'DM Serif Display', Georgia, serif",
            fontWeight: 400, fontSize:"0.9rem", letterSpacing:"0.04em",
            color: tk.isDark ? "#f2eed8" : "#1a160c",
          }}>Legal Ease AI</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
          {[["Contact","/contact"],["About","/about"]].map(([l,t])=>(
            <Link key={t} to={t} style={{
              fontFamily:"'Roboto Serif', Georgia, serif",
              fontSize:"0.9rem", color:tk.textSecondary, fontWeight:500,
              textDecoration:"none", transition:"color 0.2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.color=tk.gold}
              onMouseLeave={e=>e.currentTarget.style.color=tk.textSecondary}
            >{l}</Link>
          ))}
        </div>
        <p style={{
          fontFamily:"'Roboto Serif', Georgia, serif",
          fontSize:"0.8rem", color:tk.textSecondary, fontWeight:500,
        }}>
          © {new Date().getFullYear()} Legal Ease AI · Not legal advice
        </p>
      </div>
    </footer>
  );
}