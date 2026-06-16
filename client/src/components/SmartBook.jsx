import { useEffect, useState, useRef } from "react";
import { useTokens } from "../App";
import { useLanguage } from "../context/LanguageContext";

const TOPICS = [
  {
    id: "tenant", icon: "🏠", title: "Tenant Rights",
    points: [
      { head: "Security Deposit", body: "Landlords typically cannot keep your entire security deposit for normal wear and tear. In India, deposits above 2 months' rent may be unreasonable in most states. Always get a signed receipt." },
      { head: "Right to Privacy", body: "Landlords must provide reasonable advance notice (usually 24–48 hours) before entering your premises, except in genuine emergencies." },
      { head: "Habitability", body: "The landlord is generally responsible for major repairs (plumbing, electrical, structural). Clauses making tenants liable for all repairs are often unenforceable." },
      { head: "Termination", body: "Both parties must give reasonable notice. A clause letting the landlord evict with 7 days' notice is rarely enforceable in court." },
    ],
  },
  {
    id: "employee", icon: "💼", title: "Employee Rights",
    points: [
      { head: "Non-Compete Clauses", body: "In India, post-employment non-compete clauses are generally unenforceable under Section 27 of the Indian Contract Act. Non-solicitation may be enforceable if reasonable." },
      { head: "Notice Period", body: "Notice period clauses are binding, but excessive periods (6+ months) can be challenged. You can negotiate buyout terms." },
      { head: "Confidentiality", body: "NDAs are usually enforceable, but must be limited in scope and duration. Lifetime confidentiality clauses are often struck down." },
      { head: "Termination for Cause", body: "Termination without notice is only allowed for serious misconduct. Arbitrary termination may entitle you to severance." },
    ],
  },
  {
    id: "consumer", icon: "🛒", title: "Consumer Rights",
    points: [
      { head: "Unfair Terms", body: "Under the Consumer Protection Act 2019, unfair contract terms (hidden fees, one-sided modifications) can be challenged in consumer courts." },
      { head: "Refund Rights", body: "You have the right to a refund for defective products or services not delivered as promised, even if the contract says 'no refunds'." },
      { head: "Forced Arbitration", body: "Mandatory arbitration clauses that waive your right to go to consumer court may be challenged as unfair trade practice." },
      { head: "Data Privacy", body: "Companies must disclose how they use your data. Under DPDP Act 2023, you have the right to access, correct, and delete your data." },
    ],
  },
  {
    id: "contract", icon: "📝", title: "Contract Basics",
    points: [
      { head: "Offer & Acceptance", body: "A contract requires clear offer, acceptance, consideration (something of value exchanged), and mutual intent. Missing any of these can make it unenforceable." },
      { head: "Coercion & Undue Influence", body: "If you were pressured, misled, or didn't understand what you signed, the contract may be voidable. Always read before signing." },
      { head: "Unconscionable Clauses", body: "Extremely one-sided clauses (waiving all rights, unlimited liability) can be struck down by courts as unconscionable." },
      { head: "Modification", body: "A clause letting one party modify the contract unilaterally is usually unenforceable — changes require mutual consent in writing." },
    ],
  },
  {
    id: "platform", icon: "⚖️", title: "About Legal Ease AI",
    points: [
      { head: "What it does", body: "Analyzes legal documents and explains them in plain English. Flags risky clauses, suggests negotiation points, and extracts key deadlines." },
      { head: "Risk Scoring", body: "Documents get a 0–100 risk score. 0–30 is low (safe), 31–60 moderate, 61–85 high, 86+ critical. Use it as a quick pulse check." },
      { head: "Not legal advice", body: "Juri helps you understand documents but does not replace a lawyer. For high-stakes agreements (buying a house, major employment), always consult a professional." },
      { head: "Privacy", body: "Your documents are processed in real-time and not permanently stored. Each analysis session is isolated." },
    ],
  },
];

const LANGUAGE_NAMES = {
  hi: "Hindi (हिन्दी)", bn: "Bengali (বাংলা)", te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)", ta: "Tamil (தமிழ்)", gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)", ml: "Malayalam (മലయാളം)", pa: "Punjabi (ਪੰਜਾਬੀ)",
  or: "Odia (ଓଡ଼ିଆ)", ur: "Urdu (اردو)",
};

function detectTopicFromDocType(docType = "") {
  const t = docType.toLowerCase();
  if (/rent|lease|tenancy/.test(t)) return "tenant";
  if (/employ|nda|non[- ]?disclos|service agree/.test(t)) return "employee";
  if (/terms of service|consumer|purchase|warranty|refund|sale/.test(t)) return "consumer";
  return "contract";
}

export default function SmartBook({ onClose }) {
  const tk = useTokens();
  const { language } = useLanguage();
  const [context, setContext] = useState(null);
  const [activeId, setActiveId] = useState(TOPICS[0].id);
  // Cache translated topics: { "hi:tenant": [...points], ... }
  const translationCache = useRef({});
  const [translatedPoints, setTranslatedPoints] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    try {
      const raw = sessionStorage.getItem("juri-context");
      if (raw) {
        const ctx = JSON.parse(raw);
        setContext(ctx);
        if (ctx?.analysis?.documentType) {
          setActiveId(detectTopicFromDocType(ctx.analysis.documentType));
        }
      }
    } catch {}
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Translate topic content when language or activeId changes
  useEffect(() => {
    if (language.code === "en") {
      setTranslatedPoints(null);
      return;
    }

    const cacheKey = `${language.code}:${activeId}`;
    if (translationCache.current[cacheKey]) {
      setTranslatedPoints(translationCache.current[cacheKey]);
      return;
    }

    const topic = TOPICS.find(t => t.id === activeId);

    setTranslating(true);
    setTranslatedPoints(null);

    fetch("/api/translate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: topic.points, language: language.code }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.content) {
          translationCache.current[cacheKey] = data.content;
          setTranslatedPoints(data.content);
        }
      })
      .catch(() => setTranslatedPoints(null))
      .finally(() => setTranslating(false));
  }, [language.code, activeId]);

  const topic = TOPICS.find(t => t.id === activeId);
  const displayPoints = translatedPoints || topic.points;

  const analysis = context?.analysis;
  const riskColor = !analysis ? null
    : analysis.riskScore <= 30 ? "#10b981"
    : analysis.riskScore <= 60 ? "#f59e0b"
    : analysis.riskScore <= 85 ? "#ef4444" : "#991b1b";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "stretch", justifyContent: "flex-start" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: tk.isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)", animation: "fadeOverlay 0.25s ease" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: "480px", height: "100%",
        background: tk.isDark ? "rgba(18,16,14,0.98)" : "rgba(253,251,248,0.98)",
        borderRight: `1px solid ${tk.goldBorder}`,
        display: "flex", flexDirection: "column",
        boxShadow: tk.isDark ? "4px 0 40px rgba(0,0,0,0.5)" : "4px 0 30px rgba(0,0,0,0.12)",
        animation: "slideInLeft 0.35s cubic-bezier(.22,1,.36,1)",
      }}>
        <style>{`
          @keyframes fadeOverlay { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideInLeft { from { transform: translateX(-20px); opacity: 0 } to { transform: none; opacity: 1 } }
          @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        `}</style>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${tk.surfaceBorder}`, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: tk.goldLight, border: `1px solid ${tk.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem" }}>📚</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700, fontSize: "1.05rem", color: tk.textPrimary }}>Know Your Rights</div>
            <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.75rem", color: tk.textMuted, fontStyle: "italic" }}>
              {language.code !== "en" ? `${language.nativeLabel} में` : "Quick legal awareness guide"}
            </div>
          </div>
          <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "50%", border: `1px solid ${tk.surfaceBorder}`, background: "transparent", color: tk.textMuted, cursor: "pointer", fontSize: "0.85rem" }}>✕</button>
        </div>

        {/* Topic tabs */}
        <div style={{ padding: "0.75rem 1rem 0", borderBottom: `1px solid ${tk.surfaceBorder}`, display: "flex", gap: "0.35rem", overflowX: "auto", flexShrink: 0 }}>
          {TOPICS.map(t => (
            <button key={t.id} onClick={() => setActiveId(t.id)}
              style={{
                padding: "0.5rem 0.85rem", borderRadius: "10px 10px 0 0", border: "none",
                borderBottom: `2px solid ${activeId === t.id ? tk.gold : "transparent"}`,
                background: activeId === t.id ? tk.goldLight : "transparent",
                color: activeId === t.id ? tk.gold : tk.textMuted,
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: "0.82rem", fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
              }}>
              <span style={{ marginRight: "4px" }}>{t.icon}</span>
              {t.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {analysis && (
            <div style={{
              padding: "1rem 1.1rem", borderRadius: "12px",
              background: tk.isDark ? "rgba(201,168,76,0.10)" : "rgba(160,120,40,0.07)",
              border: `1px solid ${tk.goldBorder}`, marginBottom: "1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: tk.gold, background: tk.goldLight, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Your Document
                </span>
                {analysis.documentType && (
                  <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700, fontSize: "0.95rem", color: tk.textPrimary }}>
                    {analysis.documentType}
                  </span>
                )}
                {analysis.riskScore !== undefined && riskColor && (
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", fontWeight: 700, color: riskColor, background: `${riskColor}22`, padding: "2px 9px", borderRadius: "6px" }}>
                    {analysis.riskScore}/100
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.825rem", color: tk.textSecondary, lineHeight: 1.6, margin: "0 0 0.5rem" }}>
                Based on your document type, we've opened the most relevant section — <strong style={{ color: tk.gold }}>{topic.title}</strong>.
              </p>
              {(analysis.criticalThreats?.length > 0 || analysis.moderateThreats?.length > 0) && (
                <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.78rem", color: tk.textMuted, fontStyle: "italic" }}>
                  ⚡ Found {analysis.criticalThreats?.length || 0} critical + {analysis.moderateThreats?.length || 0} moderate risks.
                </div>
              )}
            </div>
          )}

          {/* Translating indicator */}
          {translating && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "10px", background: tk.isDark ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.06)", border: `1px solid ${tk.goldBorder}`, marginBottom: "1rem" }}>
              <span style={{ animation: "pulse 1.2s ease infinite", fontSize: "1rem" }}>🌐</span>
              <span style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.82rem", color: tk.gold }}>
                Translating to {language.nativeLabel}...
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {displayPoints.map((p, i) => (
              <div key={i} style={{ padding: "1rem 1.1rem", borderRadius: "12px", background: tk.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", border: `1px solid ${tk.surfaceBorder}`, borderLeft: `3px solid ${tk.gold}` }}>
                <h4 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.975rem", fontWeight: 700, color: tk.textPrimary, margin: "0 0 0.45rem" }}>{p.head}</h4>
                <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.875rem", color: tk.textSecondary, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.72rem", color: tk.textMuted, fontStyle: "italic", textAlign: "center", marginTop: "1.5rem", padding: "0 1rem", lineHeight: 1.6 }}>
            ⚠️ This is general informational content, not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}