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
    <button onClick={() => { setMode(val); setAnalysis(null); setComparison(null); setGenResult(""); setError(""); setFile(null); setFileA(null); setFileB(null); }} style={{ padding: "0.6rem 1.1rem", borderRadius: "10px", border: `1px solid ${mode === val ? tk.gold : tk.goldBorder}`, background: mode === val ? tk.gold : "transparent", color: mode === val ? "#fff" : tk.textMuted, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
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
            {tabBtn("📄 Upload File", "file")}
            {tabBtn("✍️ Paste Text", "text")}
            {tabBtn("🔀 Compare", "compare")}
            {tabBtn("✨ Generate", "generate")}
          </div>
          {/* Language Selector — only shown for analyze modes */}
          {(mode === "file" || mode === "text") && <LanguageSelector tk={tk} />}
        </div>
        {mode === "file" && (
          <div>
            <div onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFilePick(e.dataTransfer.files[0]); }}
              style={{ border: `2px dashed ${file ? tk.gold : tk.goldBorder}`, borderRadius: "12px", padding: "2.5rem", textAlign: "center", cursor: "pointer", background: file ? "rgba(202,154,88,0.05)" : "transparent", transition: "all 0.2s", marginBottom: "1rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📁</div>
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
