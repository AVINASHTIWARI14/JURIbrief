import { Link } from "react-router-dom";
import { useTokens } from "../App";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  const tk = useTokens();

  return (
    <footer
      style={{
        borderTop: `1px solid ${tk.surfaceBorder}`,
        padding: "1.5rem 1.5rem",
        background: tk.isDark ? "#0e0e0e" : "#b9b2a5",
      }}
    >
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Left — Logo */}
        <BrandLogo size="small" />

        {/* Center — Disclaimer */}
        <div
          style={{
            flex: "1 1 400px",
            maxWidth: "560px",
            textAlign: "center",
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: "0.75rem",
            lineHeight: 1.5,
            color: tk.textSecondary,
          }}
        >
          <div>
            © {new Date().getFullYear()} JURIbrief. All rights reserved.
          </div>
          <div>
            JURIbrief provides AI-generated summaries for informational
            purposes only and does not constitute legal advice.
          </div>
        </div>

        {/* Right — Privacy Policy */}
        <Link
          to="/privacy"
          style={{
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: "0.85rem",
            color: tk.textSecondary,
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = tk.gold;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = tk.textSecondary;
          }}
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}