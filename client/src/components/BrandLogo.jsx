import { useTheme } from "../App";

export default function BrandLogo({ size = "normal" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sizes = {
    small: { juri: "1.35rem", brief: "1.5rem" },
    normal: { juri: "1.8rem", brief: "2rem" },
    large: { juri: "2.6rem", brief: "2.9rem" },
  };

  const s = sizes[size] || sizes.normal;

  return (
    <span
      aria-label="JURIbrief"
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "'IM Fell French Canon', serif",
          fontSize: s.juri,
          color: "#c9a84c",
          letterSpacing: "0.01em",
        }}
      >
        JURI
      </span>
      <span
        style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: s.brief,
          color: isDark ? "#ffffff" : "#000000",
          marginLeft: "0.08em",
        }}
      >
        brief
      </span>
    </span>
  );
}
