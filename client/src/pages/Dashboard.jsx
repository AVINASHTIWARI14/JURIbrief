import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "../App";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

function ThreatCard({ threat, level, tk }) {
  const isRed = level === "critical";
  const color = isRed ? "#DC2626" : "#D97706";
  const bg = isRed
    ? (tk.isDark ? "rgba(220,38,38,0.12)" : "rgba(220,38,38,0.06)")
    : (tk.isDark ? "rgba(217,119,6,0.12)" : "rgba(217,119,6,0.06)");
  const border = isRed ? "rgba(220,38,38,0.28)" : "rgba(217,119,6,0.28)";
  const quoteBg = tk.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${color}`, borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "0.75rem", transition: "transform .2s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span>{isRed ? "🔴" : "🟡"}</span>
        <strong style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.975rem", color }}>{threat.title}</strong>
        <span style={{ marginLeft: "auto", fontSize: "0.68rem", fontWeight: 700, color, background: isRed ? "rgba(220,38,38,0.18)" : "rgba(217,119,6,0.18)", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.08em" }}>
          {isRed ? "CRITICAL" : "MODERATE"}
        </span>
      </div>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: tk.textSecondary, lineHeight: 1.6 }}>{threat.description}</p>
      {threat.quote && (
        <blockquote style={{ margin: 0, padding: "0.6rem 0.85rem", background: quoteBg, borderRadius: "6px", fontStyle: "italic", fontSize: "0.825rem", color: tk.textMuted, borderLeft: `2px solid ${border}`, lineHeight: 1.55 }}>
          "{threat.quote}"
        </blockquote>
      )}
    </div>
  );
}

function colorForScore(s) {
  if (s <= 30) return "#10b981";
  if (s <= 60) return "#f59e0b";
  if (s <= 85) return "#ef4444";
  return "#991b1b";
}
function labelForScore(s) {
  if (s <= 30) return "LOW RISK";
  if (s <= 60) return "MODERATE";
  if (s <= 85) return "HIGH RISK";
  return "CRITICAL";
}

function CircularGauge({ score, tk }) {
  const target = Math.max(0, Math.min(100, score || 0));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    const duration = 1000;
    const start = performance.now();
    let frameId;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setCurrent(target * eased);
      if (t < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  const displayScore = Math.round(current);
  const color = colorForScore(current);
  const label = labelForScore(current);
  const radius = 80;
  const strokeW = 14;
  const arcLength = Math.PI * radius;
  const fillLength = (current / 100) * arcLength;
  const trackColor = tk.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div style={{ position: "relative", width: "200px", height: "120px", margin: "0 auto" }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={trackColor} strokeWidth={strokeW} strokeLinecap="round"/>
        <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength - fillLength}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "4px", pointerEvents: "none" }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2.75rem", fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{displayScore}</div>
        <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.68rem", fontWeight: 700, color, letterSpacing: "0.14em", marginTop: "4px" }}>{label}</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tk, accent }) {
  return (
    <div style={{ background: tk.surface, border: `1px solid ${tk.surfaceBorder}`, borderRadius: "12px", padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.7rem", color: tk.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: accent || tk.textPrimary, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      </div>
    </div>
  );
}

function AnalysisResult({ analysis, tk }) {
  const cardStyle = { background: tk.surface, border: `1px solid ${tk.goldBorder}`, borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" };
  const sectionTitle = (icon, text) => (
    <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: tk.textPrimary, margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span>{icon}</span> {text}
    </h3>
  );
  const critCount = analysis.criticalThreats?.length || 0;
  const modCount = analysis.moderateThreats?.length || 0;
  const totalThreats = critCount + modCount;
  const score = analysis.riskScore ?? 0;
  const riskLabel = score <= 30 ? "Low" : score <= 60 ? "Moderate" : score <= 85 ? "High" : "Critical";
  const riskColor = score <= 30 ? "#10b981" : score <= 60 ? "#f59e0b" : score <= 85 ? "#ef4444" : "#991b1b";
  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Headline banner — score gauge + title */}
      <div style={{ ...cardStyle, padding: "2rem 1.5rem" }}>
        {analysis.riskScore !== undefined && <CircularGauge score={analysis.riskScore} tk={tk} />}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700, fontSize: "1.2rem", color: tk.textPrimary, marginBottom: "0.35rem" }}>
            {totalThreats === 0 ? "Document looks safe" : `${totalThreats} risk${totalThreats > 1 ? "s" : ""} detected`}
          </div>
          {analysis.documentType && (
            <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 700, color: tk.gold, background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, padding: "3px 12px", borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {analysis.documentType}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <StatCard icon="⚠️" label="Risk Level" value={riskLabel} accent={riskColor} tk={tk}/>
        <StatCard icon="🔴" label="Critical" value={critCount} accent={critCount > 0 ? "#DC2626" : tk.textPrimary} tk={tk}/>
        <StatCard icon="🟡" label="Moderate" value={modCount} accent={modCount > 0 ? "#D97706" : tk.textPrimary} tk={tk}/>
        <StatCard icon="📌" label="Key Points" value={analysis.keyPoints?.length || 0} tk={tk}/>
      </div>
      <div style={cardStyle}>
        {sectionTitle("📋", "Document Summary")}
        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.95rem", color: tk.textPrimary, lineHeight: 1.7, margin: "0 0 1rem" }}>{analysis.summary}</p>
        {analysis.keyPoints?.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {analysis.keyPoints.map((pt, i) => <li key={i} style={{ fontSize: "0.875rem", color: tk.textMuted, lineHeight: 1.6, marginBottom: "0.35rem" }}>{pt}</li>)}
          </ul>
        )}
      </div>
      {analysis.criticalThreats?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("🔴", `Critical Risks (${analysis.criticalThreats.length})`)}
          {analysis.criticalThreats.map((t, i) => <ThreatCard key={i} threat={t} level="critical" tk={tk} />)}
        </div>
      )}
      {analysis.moderateThreats?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("🟡", `Moderate Risks (${analysis.moderateThreats.length})`)}
          {analysis.moderateThreats.map((t, i) => <ThreatCard key={i} threat={t} level="moderate" tk={tk} />)}
        </div>
      )}
      {analysis.deadlines?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("📅", `Deadlines & Dates (${analysis.deadlines.length})`)}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {analysis.deadlines.map((d, i) => {
              const urgColor = d.urgency === "high" ? "#DC2626" : d.urgency === "medium" ? "#D97706" : "#10b981";
              const urgBg = d.urgency === "high" ? "rgba(220,38,38,0.10)" : d.urgency === "medium" ? "rgba(217,119,6,0.10)" : "rgba(16,185,129,0.10)";
              return (
                <div key={i} style={{ display: "flex", gap: "0.85rem", padding: "0.85rem 1rem", borderRadius: "10px", background: urgBg, border: `1px solid ${urgColor}33`, borderLeft: `4px solid ${urgColor}` }}>
                  <div style={{ flexShrink: 0, width: "56px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${urgColor}22`, paddingRight: "0.75rem" }}>
                    <span style={{ fontSize: "1.3rem" }}>{d.urgency === "high" ? "⏰" : d.urgency === "medium" ? "📌" : "🗓️"}</span>
                    <span style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.62rem", fontWeight: 700, color: urgColor, letterSpacing: "0.08em", marginTop: "2px", textTransform: "uppercase" }}>{d.urgency || "info"}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                      <strong style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.925rem", color: tk.textPrimary }}>{d.label}</strong>
                      {d.timing && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: urgColor, background: tk.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.02em" }}>{d.timing}</span>}
                    </div>
                    {d.description && <p style={{ margin: 0, fontSize: "0.825rem", color: tk.textSecondary, lineHeight: 1.55 }}>{d.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {analysis.negotiationTips?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("🤝", "Negotiation Tips")}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {analysis.negotiationTips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem 1rem", borderRadius: "10px", background: tk.isDark ? "rgba(201,168,76,0.06)" : "rgba(160,120,40,0.05)", border: `1px solid ${tk.goldBorder}` }}>
                <span style={{ color: tk.gold, fontWeight: 700, flexShrink: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>{String(i + 1).padStart(2, "0")}</span>
                <p style={{ margin: 0, fontSize: "0.875rem", color: tk.textSecondary, lineHeight: 1.65 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImpactPill({ impact }) {
  const map = {
    good: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "BETTER FOR YOU" },
    bad: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "WORSE FOR YOU" },
    neutral: { color: "#6b7280", bg: "rgba(107,114,128,0.12)", label: "NEUTRAL" },
  };
  const m = map[impact] || map.neutral;
  return <span style={{ fontSize: "0.62rem", fontWeight: 700, color: m.color, background: m.bg, padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{m.label}</span>;
}

function ComparisonResult({ comparison, tk }) {
  const cardStyle = { background: tk.surface, border: `1px solid ${tk.goldBorder}`, borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: tk.isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 24px rgba(0,0,0,0.07)" };
  const sectionTitle = (icon, text) => (
    <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: tk.textPrimary, margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span>{icon}</span> {text}
    </h3>
  );
  const favorsLabel = comparison.favorsTenant === "A" ? "Version A (older) is better for you" :
    comparison.favorsTenant === "B" ? "Version B (newer) is better for you" :
    "Both versions are roughly equivalent";
  const favorsColor = comparison.favorsTenant === "A" ? "#10b981" : comparison.favorsTenant === "B" ? "#10b981" : "#6b7280";

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Summary banner */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>🔀</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700, fontSize: "1.1rem", color: tk.textPrimary, marginBottom: "0.4rem" }}>Comparison Summary</div>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.925rem", color: tk.textSecondary, lineHeight: 1.65, margin: "0 0 0.75rem" }}>{comparison.summary}</p>
            <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 700, color: favorsColor, background: `${favorsColor}22`, padding: "4px 12px", borderRadius: "999px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {favorsLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <StatCard icon="➕" label="New Clauses" value={comparison.newClauses?.length || 0} accent="#10b981" tk={tk}/>
        <StatCard icon="➖" label="Removed" value={comparison.removedClauses?.length || 0} accent="#ef4444" tk={tk}/>
        <StatCard icon="✏️" label="Changed" value={comparison.changedClauses?.length || 0} accent="#f59e0b" tk={tk}/>
        <StatCard icon="⚠️" label="New Risks" value={comparison.newRisks?.length || 0} accent={comparison.newRisks?.length > 0 ? "#DC2626" : tk.textPrimary} tk={tk}/>
      </div>

      {comparison.newClauses?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("➕", `Added in Version B (${comparison.newClauses.length})`)}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {comparison.newClauses.map((c, i) => (
              <div key={i} style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: tk.isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.05)", borderLeft: "4px solid #10b981" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                  <strong style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.925rem", color: tk.textPrimary }}>{c.title}</strong>
                  <ImpactPill impact={c.impact}/>
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: tk.textSecondary, lineHeight: 1.55 }}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {comparison.removedClauses?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("➖", `Removed from Version A (${comparison.removedClauses.length})`)}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {comparison.removedClauses.map((c, i) => (
              <div key={i} style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: tk.isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)", borderLeft: "4px solid #ef4444" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                  <strong style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.925rem", color: tk.textPrimary, textDecoration: "line-through", opacity: 0.7 }}>{c.title}</strong>
                  <ImpactPill impact={c.impact}/>
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: tk.textSecondary, lineHeight: 1.55 }}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {comparison.changedClauses?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("✏️", `Changed Clauses (${comparison.changedClauses.length})`)}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {comparison.changedClauses.map((c, i) => (
              <div key={i} style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: tk.isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.05)", borderLeft: "4px solid #f59e0b" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  <strong style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.925rem", color: tk.textPrimary }}>{c.title}</strong>
                  <ImpactPill impact={c.impact}/>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.83rem", lineHeight: 1.55 }}>
                  <div style={{ padding: "0.5rem 0.7rem", background: tk.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "6px", color: tk.textSecondary }}>
                    <strong style={{ color: tk.textMuted, fontSize: "0.7rem", letterSpacing: "0.1em", fontWeight: 700 }}>VERSION A:</strong> {c.versionA}
                  </div>
                  <div style={{ padding: "0.5rem 0.7rem", background: tk.isDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.06)", borderRadius: "6px", color: tk.textSecondary }}>
                    <strong style={{ color: "#f59e0b", fontSize: "0.7rem", letterSpacing: "0.1em", fontWeight: 700 }}>VERSION B:</strong> {c.versionB}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {comparison.newRisks?.length > 0 && (
        <div style={cardStyle}>
          {sectionTitle("⚠️", "New Risks Introduced")}
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: tk.textSecondary }}>
            {comparison.newRisks.map((r, i) => <li key={i} style={{ fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "0.4rem" }}>{r}</li>)}
          </ul>
        </div>
      )}

      {comparison.recommendation && (
        <div style={{ ...cardStyle, background: tk.isDark ? "rgba(201,168,76,0.08)" : "rgba(160,120,40,0.05)", borderColor: tk.goldBorder }}>
          {sectionTitle("💡", "Recommendation")}
          <p style={{ margin: 0, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.95rem", color: tk.textPrimary, lineHeight: 1.65 }}>{comparison.recommendation}</p>
        </div>
      )}
    </div>
  );
}

function LanguageSelector({ tk }) {
  const { language, changeLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          fontFamily: "'Roboto Serif', Georgia, serif",
          fontSize: "0.8rem", fontWeight: 600,
          background: tk.isDark ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.06)",
          border: `1px solid ${tk.goldBorder}`,
          color: tk.gold, padding: "0.42rem 0.75rem",
          borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = tk.isDark ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = tk.isDark ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.06)"; }}
      >
        🌐 {language.nativeLabel}
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: tk.isDark ? "#111" : "#faf8f4",
          border: `1px solid ${tk.surfaceBorder}`,
          borderRadius: "12px", padding: "0.4rem",
          boxShadow: "0 10px 28px rgba(0,0,0,0.2)",
          minWidth: "170px", zIndex: 999,
          maxHeight: "300px", overflowY: "auto",
        }}>
          {languages.map((lang) => {
            const active = language.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => { changeLanguage(lang); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", border: "none", padding: "0.45rem 0.7rem",
                  borderRadius: "8px", cursor: "pointer", textAlign: "left",
                  background: active ? (tk.isDark ? "rgba(212,175,55,0.12)" : "rgba(212,175,55,0.09)") : "transparent",
                  color: active ? tk.gold : tk.textSecondary,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = tk.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.875rem" }}>{lang.nativeLabel}</span>
                {active && <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const tk = useTokens();
  const navigate = useNavigate();
  const { user: authUser, profile } = useAuth();
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [stage, setStage] = useState(null); // "uploading" | "analyzing"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [englishAnalysis, setEnglishAnalysis] = useState(null); // always English base
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // When language changes and we already have a result — translate without re-analyzing
  useEffect(() => {
    if (!englishAnalysis) return;
    if (language.code === "en") { setAnalysis(englishAnalysis); return; }

    setTranslating(true);
    axios.post("/api/translate-analysis", { analysis: englishAnalysis, language: language.code })
      .then(res => { if (res.data.analysis) setAnalysis(res.data.analysis); })
      .catch(() => {}) // silently fail — keep current analysis
      .finally(() => setTranslating(false));
  }, [language.code]); // eslint-disable-line

  // Compare mode state
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [comparison, setComparison] = useState(null);
  const fileARef = useRef();
  const fileBRef = useRef();

  // Generate mode state
  const [genDesc, setGenDesc] = useState("");
  const [genType, setGenType] = useState("");
  const [genJurisdiction, setGenJurisdiction] = useState("India");
  const [genResult, setGenResult] = useState("");

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_EXT = [".pdf", ".docx", ".txt"];

  const validateFile = (f) => {
    if (!f) return "Please select a file.";
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!ALLOWED_EXT.includes(ext)) return `Unsupported format. Use: ${ALLOWED_EXT.join(", ")}`;
    if (f.size > MAX_SIZE) return `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`;
    return null;
  };

  const handleFilePick = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setError(""); setFile(f); setAnalysis(null);
  };

  useEffect(() => {
    if (!authUser) { navigate("/auth"); return; }
    setUser({
      username: profile?.full_name || authUser.email?.split("@")[0] || "User",
      email: authUser.email,
    });
  }, [authUser, profile]);

  const handleAnalyze = async () => {
    setError(""); setAnalysis(null); setLoading(true); setUploadProgress(0);
    try {
      let res;
      if (mode === "file") {
        const vErr = validateFile(file);
        if (vErr) { setError(vErr); setLoading(false); return; }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", language.code);
        setStage("uploading");
        res = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(pct);
              if (pct === 100) setStage("analyzing");
            }
          },
        });
      } else {
        if (textInput.trim().length < 50) { setError("Please paste at least 50 characters of legal text."); setLoading(false); return; }
        setStage("analyzing");
        res = await axios.post("/api/analyze-text", { text: textInput, language: language.code });
      }
      if (res.data.analysis) {
        setAnalysis(res.data.analysis);
        // Store the English base for instant language switching without re-analyzing
        setEnglishAnalysis(res.data.englishAnalysis || res.data.analysis);
        // Save context for Juri to use in follow-up chat
        try {
          sessionStorage.setItem("juri-context", JSON.stringify({
            analysis: res.data.englishAnalysis || res.data.analysis,
            documentText: res.data.text || (mode === "text" ? textInput : ""),
          }));
        } catch {}
      } else { setError("Analysis failed — check if GEMINI_API_KEY is set on the server."); }
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Make sure the backend is running.");
    } finally {
      setLoading(false); setStage(null); setUploadProgress(0);
    }
  };

  const handleGenerate = async () => {
    setError(""); setGenResult("");
    if (genDesc.trim().length < 20) { setError("Describe the document in at least 20 characters."); return; }
    setLoading(true); setStage("analyzing");
    try {
      const res = await axios.post("/api/generate", {
        description: genDesc,
        documentType: genType || null,
        jurisdiction: genJurisdiction || "India",
      });
      if (res.data.document) setGenResult(res.data.document);
      else setError("Generation failed. Please try again.");
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Make sure the backend is running.");
    } finally {
      setLoading(false); setStage(null);
    }
  };

  const downloadTxt = () => {
    if (!genResult) return;
    const blob = new Blob([genResult], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (genType || "legal-document").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    a.download = `${safeName || "legal-document"}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCompare = async () => {
    setError(""); setComparison(null);
    const errA = validateFile(fileA);
    const errB = validateFile(fileB);
    if (errA || errB) { setError(errA || errB); return; }
    setLoading(true); setStage("analyzing");
    try {
      const fd = new FormData();
      fd.append("fileA", fileA);
      fd.append("fileB", fileB);
      const res = await axios.post("/api/compare", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.comparison) setComparison(res.data.comparison);
      else setError("Comparison failed. Please try again.");
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Make sure the backend is running.");
    } finally {
      setLoading(false); setStage(null);
    }
  };

  if (!user) return null;

  const cardStyle = { background: tk.surface, border: `1px solid ${tk.goldBorder}`, borderRadius: "16px", padding: "1.5rem", boxShadow: tk.isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 24px rgba(0,0,0,0.07)" };
  const tabBtn = (label, val) => (
    <button onClick={() => { setMode(val); setAnalysis(null); setComparison(null); setGenResult(""); setError(""); setFile(null); setFileA(null); setFileB(null); }} style={{ padding: "0.6rem 1.1rem", borderRadius: "10px", border: `1px solid ${mode === val ? tk.gold : tk.goldBorder}`, background: mode === val ? tk.gold : "transparent", color: "#000", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.45rem" }}>
      {label}
    </button>
  );

  const fileSlot = (label, f, setF, ref) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.78rem", fontWeight: 600, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{label}</div>
      <div onClick={() => ref.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const picked = e.dataTransfer.files[0]; const vErr = validateFile(picked); if (vErr) { setError(vErr); return; } setError(""); setF(picked); setComparison(null); }}
        style={{ border: `2px dashed ${f ? tk.gold : tk.goldBorder}`, borderRadius: "12px", padding: "1.5rem 1rem", textAlign: "center", cursor: "pointer", background: f ? "rgba(202,154,88,0.05)" : "transparent", transition: "all 0.2s", minHeight: "110px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
        <div style={{ fontSize: "1.5rem" }}>📁</div>
        {f ? (
          <>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.85rem", fontWeight: 700, color: tk.gold, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
            <div style={{ fontSize: "0.72rem", color: tk.textMuted }}>{(f.size / 1024).toFixed(1)} KB — click to change</div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.9rem", fontWeight: 600, color: tk.textPrimary }}>Drop or click</div>
            <div style={{ fontSize: "0.7rem", color: tk.textMuted }}>PDF, DOCX, TXT</div>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={e => { const picked = e.target.files[0]; const vErr = validateFile(picked); if (vErr) { setError(vErr); return; } setError(""); setF(picked); setComparison(null); }} />
    </div>
  );

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "6rem 1.5rem 3rem", animation: "fadeIn 0.4s ease" }}>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} } @keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(0.7)} }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, color: tk.textPrimary, letterSpacing: "-0.03em", margin: "0 0 0.25rem" }}>
            Welcome, <span style={{ color: tk.gold }}>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there"}</span>
          </h1>
          <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "1rem", color: tk.textMuted, fontStyle: "italic", margin: 0 }}>JURIbrief Dashboard</p>
        </div>
        <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.85rem", color: tk.textMuted, fontStyle: "italic", margin: 0 }}>{user?.email}</p>
      </div>
      <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${tk.gold}, transparent)`, marginBottom: "2.5rem" }} />
      <div style={{ ...cardStyle, marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {tabBtn(
              <><img src="/upload-file-icon.svg" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} /> Upload File</>,
              "file"
            )}
            {tabBtn(
              <><img src="/paste-text-icon.svg" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} /> Paste Text</>,
              "text"
            )}
            {tabBtn(
              <><img src="/compare-documents-icon.svg" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} /> Compare</>,
              "compare"
            )}
            {tabBtn(
              <><img src="/generate-document-icon.svg" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} /> Generate</>,
              "generate"
            )}
          </div>
          {/* Language Selector — only shown for analyze modes */}
          {(mode === "file" || mode === "text") && <LanguageSelector tk={tk} />}
        </div>
        {mode === "file" && (
          <div>
            <div onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFilePick(e.dataTransfer.files[0]); }}
              style={{ border: `2px dashed ${file ? tk.gold : tk.goldBorder}`, borderRadius: "12px", padding: "2.5rem", textAlign: "center", cursor: "pointer", background: file ? "rgba(202,154,88,0.05)" : "transparent", transition: "all 0.2s", marginBottom: "1rem" }}>
              <img src="data:image/png;base64,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" alt="" style={{ width: "86px", height: "86px", objectFit: "contain", marginBottom: "0.75rem" }} />
              {file ? (
                <div>
                  <div style={{ fontWeight: 700, color: tk.gold, fontFamily: "'DM Serif Display', Georgia, serif" }}>{file.name}</div>
                  <div style={{ fontSize: "0.8rem", color: tk.textMuted, marginTop: "0.25rem" }}>{(file.size / 1024).toFixed(1)} KB — Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ color: tk.textPrimary, fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 600 }}>Drop file here or click to browse</div>
                  <div style={{ fontSize: "0.8rem", color: tk.textMuted, marginTop: "0.35rem" }}>Supports PDF, DOCX, TXT</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={e => handleFilePick(e.target.files[0])} />
          </div>
        )}
        {mode === "text" && (
          <textarea value={textInput} onChange={e => { setTextInput(e.target.value); setAnalysis(null); }}
            placeholder="Paste your legal document, contract, NDA, or any legal text here..."
            style={{ width: "100%", minHeight: "200px", padding: "1rem", borderRadius: "12px", border: `1px solid ${tk.goldBorder}`, background: tk.surface, color: tk.textPrimary, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.9rem", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.5rem" }} />
        )}
        {mode === "compare" && (
          <div>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", color: tk.textSecondary, margin: "0 0 1rem", lineHeight: 1.55 }}>
              Upload two versions of a legal document — Juri will highlight what changed, new risks introduced, and what you should push back on.
            </p>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {fileSlot("Version A (older)", fileA, setFileA, fileARef)}
              {fileSlot("Version B (newer)", fileB, setFileB, fileBRef)}
            </div>
          </div>
        )}
        {mode === "generate" && (
          <div>
            <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", color: tk.textSecondary, margin: "0 0 1rem", lineHeight: 1.55 }}>
              Describe what you need in plain English — Juri will draft a complete legal document with standard clauses and signature blocks.
            </p>
            <div style={{ marginBottom: "0.85rem" }}>
              <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.78rem", fontWeight: 600, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Document Type (optional)</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {["NDA", "Rental Agreement", "Employment Contract", "Service Agreement", "Partnership", "Other"].map(t => (
                  <button key={t} onClick={() => setGenType(t === "Other" ? "" : t)}
                    style={{ padding: "0.45rem 0.85rem", borderRadius: "999px", border: `1px solid ${genType === t ? tk.gold : tk.goldBorder}`, background: genType === t ? tk.goldLight : "transparent", color: genType === t ? tk.gold : tk.textMuted, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={genDesc}
              onChange={e => { setGenDesc(e.target.value); setGenResult(""); }}
              placeholder="e.g. Write me a rent agreement document"
              style={{ width: "100%", minHeight: "120px", padding: "1rem", borderRadius: "12px", border: `1px solid ${tk.goldBorder}`, background: tk.surface, color: tk.textPrimary, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.9rem", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", color: tk.textMuted, fontWeight: 600 }}>Jurisdiction:</span>
              <select value={genJurisdiction} onChange={e => setGenJurisdiction(e.target.value)}
                style={{ padding: "0.4rem 0.75rem", borderRadius: "8px", border: `1px solid ${tk.goldBorder}`, background: tk.surface, color: tk.textPrimary, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.85rem", cursor: "pointer", outline: "none" }}>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Singapore</option>
                <option>UAE</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        )}
        {error && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#DC2626", fontSize: "0.875rem" }}>
            ⚠️ {error}
          </div>
        )}
        <button onClick={mode === "compare" ? handleCompare : mode === "generate" ? handleGenerate : handleAnalyze} disabled={loading} style={{ width: "100%", padding: "0.875rem", borderRadius: "12px", border: "none", background: loading ? tk.goldBorder : `linear-gradient(135deg, ${tk.gold}, #B8860B)`, color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          {loading ? (
            <>
              <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              {stage === "uploading" ? `Uploading… ${uploadProgress}%` : (mode === "compare" ? "Comparing documents…" : mode === "generate" ? "Drafting document…" : "Analyzing with AI…")}
            </>
          ) : (mode === "compare" ? "🔀 Compare Documents" : mode === "generate" ? "✨ Generate Document" : "🔍 Analyze Document")}
        </button>
        {loading && stage === "uploading" && (
          <div style={{ marginTop: "0.75rem", height: "4px", borderRadius: "999px", background: tk.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${uploadProgress}%`, background: `linear-gradient(90deg, ${tk.gold}, #B8860B)`, borderRadius: "999px", transition: "width 0.2s ease" }} />
          </div>
        )}
        {loading && stage === "analyzing" && (
          <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", color: tk.textMuted, fontStyle: "italic" }}>
            <span style={{ display: "inline-flex", gap: "3px" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: tk.gold, animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}/>
              ))}
            </span>
            Reading every clause of your document
          </div>
        )}
        <p style={{ fontSize: "0.75rem", color: tk.textMuted, textAlign: "center", margin: "0.75rem 0 0", fontStyle: "italic" }}>Powered by Google Gemini AI — threats color-coded by severity</p>
      </div>
      {translating && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.25rem", borderRadius: "12px", background: tk.isDark ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.06)", border: `1px solid ${tk.goldBorder}`, marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.2rem", animation: "spin 1s linear infinite" }}>🌐</span>
          <span style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", color: tk.gold }}>
            Translating to {language.nativeLabel}...
          </span>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      )}
      {analysis && <AnalysisResult analysis={analysis} tk={tk} />}
      {comparison && <ComparisonResult comparison={comparison} tk={tk} />}
      {genResult && (
        <div style={{ ...cardStyle, animation: "fadeIn 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: tk.textPrimary, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📄</span> Generated Document
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => { navigator.clipboard.writeText(genResult); }}
                style={{ padding: "0.45rem 0.9rem", borderRadius: "8px", border: `1px solid ${tk.goldBorder}`, background: "transparent", color: tk.gold, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = tk.goldLight}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                📋 Copy
              </button>
              <button onClick={downloadTxt}
                style={{ padding: "0.45rem 0.9rem", borderRadius: "8px", border: "none", background: tk.gold, color: "#fff", fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                ⬇ Download .txt
              </button>
            </div>
          </div>
          <pre style={{
            margin: 0,
            padding: "1.25rem",
            borderRadius: "10px",
            background: tk.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)",
            border: `1px solid ${tk.surfaceBorder}`,
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: "0.85rem",
            color: tk.textPrimary,
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: "600px",
            overflowY: "auto",
          }}>{genResult}</pre>
          <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.72rem", color: tk.textMuted, fontStyle: "italic", textAlign: "center", margin: "1rem 0 0", lineHeight: 1.6 }}>
            ⚠️ AI-generated draft — review carefully with a lawyer before signing.
          </p>
        </div>
      )}
    </div>
  );
}
