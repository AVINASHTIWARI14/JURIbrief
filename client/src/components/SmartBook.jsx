import { useEffect, useState, useRef } from "react";
import { useTokens } from "../App";
import { useLanguage } from "../context/LanguageContext";

const TOPICS = [
  {
    id: "tenant", icon: "tenant", title: "Tenant Rights",
    points: [
      { head: "Security Deposit", body: "Landlords typically cannot keep your entire security deposit for normal wear and tear. In India, deposits above 2 months' rent may be unreasonable in most states. Always get a signed receipt." },
      { head: "Right to Privacy", body: "Landlords must provide reasonable advance notice (usually 24–48 hours) before entering your premises, except in genuine emergencies." },
      { head: "Habitability", body: "The landlord is generally responsible for major repairs (plumbing, electrical, structural). Clauses making tenants liable for all repairs are often unenforceable." },
      { head: "Termination", body: "Both parties must give reasonable notice. A clause letting the landlord evict with 7 days' notice is rarely enforceable in court." },
    ],
  },
  {
    id: "employee", icon: "employee", title: "Employee Rights",
    points: [
      { head: "Non-Compete Clauses", body: "In India, post-employment non-compete clauses are generally unenforceable under Section 27 of the Indian Contract Act. Non-solicitation may be enforceable if reasonable." },
      { head: "Notice Period", body: "Notice period clauses are binding, but excessive periods (6+ months) can be challenged. You can negotiate buyout terms." },
      { head: "Confidentiality", body: "NDAs are usually enforceable, but must be limited in scope and duration. Lifetime confidentiality clauses are often struck down." },
      { head: "Termination for Cause", body: "Termination without notice is only allowed for serious misconduct. Arbitrary termination may entitle you to severance." },
    ],
  },
  {
    id: "consumer", icon: "consumer", title: "Consumer Rights",
    points: [
      { head: "Unfair Terms", body: "Under the Consumer Protection Act 2019, unfair contract terms (hidden fees, one-sided modifications) can be challenged in consumer courts." },
      { head: "Refund Rights", body: "You have the right to a refund for defective products or services not delivered as promised, even if the contract says 'no refunds'." },
      { head: "Forced Arbitration", body: "Mandatory arbitration clauses that waive your right to go to consumer court may be challenged as unfair trade practice." },
      { head: "Data Privacy", body: "Companies must disclose how they use your data. Under DPDP Act 2023, you have the right to access, correct, and delete your data." },
    ],
  },
  {
    id: "contract", icon: "contract", title: "Contract Basics",
    points: [
      { head: "Offer & Acceptance", body: "A contract requires clear offer, acceptance, consideration (something of value exchanged), and mutual intent. Missing any of these can make it unenforceable." },
      { head: "Coercion & Undue Influence", body: "If you were pressured, misled, or didn't understand what you signed, the contract may be voidable. Always read before signing." },
      { head: "Unconscionable Clauses", body: "Extremely one-sided clauses (waiving all rights, unlimited liability) can be struck down by courts as unconscionable." },
      { head: "Modification", body: "A clause letting one party modify the contract unilaterally is usually unenforceable — changes require mutual consent in writing." },
    ],
  },
  {
    id: "platform", icon: "about", title: "About JURIbrief",
    points: [
      { head: "What it does", body: "Analyzes legal documents and explains them in plain English. Flags risky clauses, suggests negotiation points, and extracts key deadlines." },
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

function TopicIllustration({ type, size = 34 }) {
  const common = { width: size, height: size, viewBox: "0 0 512 512", "aria-hidden": true };
  if (type === "tenant") return <svg {...common}>
    <circle cx="404" cy="66" r="65" fill="#FFD956"/>
    <path d="M28 260 90 98q15-26 31 0l43 112v190H28Z" fill="#D8DC35"/><path d="M90 98q16-24 31 0l43 112v190H90Z" fill="#9DBA28"/>
    <path d="M146 488V276L302 142l162 134v212Z" fill="#FFF2DC"/><path d="M302 142 464 276v212H302Z" fill="#FFE3BE"/>
    <path d="M126 276 302 126l176 150" stroke="#FF3D62" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/><path d="M210 488V356q0-14 14-14h44q14 0 14 14v132" fill="#A64F3D"/><rect x="331" y="340" width="82" height="86" rx="14" fill="#A64F3D"/><rect x="356" y="365" width="38" height="38" fill="#B9F7F5"/><rect y="480" width="512" height="32" rx="16" fill="#9DBA28"/>
  </svg>;
  if (type === "employee") return <svg {...common}>
    <path d="M138 180V120C138 54 186 4 255 4s117 50 117 116v96H138Z" fill="#F0C879"/><path d="M255 4c69 0 117 50 117 116v96H255Z" fill="#E8AD49"/><path d="M168 124c0-42 30-74 76-74s76 32 76 74v105c0 52-36 90-76 90s-76-38-76-90Z" fill="#FFF0D5"/>
    <path d="M55 512V421c0-55 40-82 98-97l61-20 42 100 42-100 61 20c58 15 98 42 98 97v91Z" fill="#77717D"/><path d="M214 304h84l-42 100Z" fill="#E17F88"/>
  </svg>;
  if (type === "consumer") return <svg {...common}>
    <path d="M204 40q-42-8-55-32 36 8 53-4-6 22 17 28l-9 65-34 45 10 83 30 38-16 64 24 185h84l-6-184 29-76-1-107q0-76-65-105Z" fill="#171923"/>
    <path d="M180 95q0-57 49-57t49 57v72q0 40-40 55l-3 44-40 22-1-67q-14-15-14-42Z" fill="#FFB6A3"/><path d="M112 180q-48 12-57 64L36 353q-2 28 26 32l41 3 30-129 11 112h181l13-112 31 129 42-3q28-4 26-32l-19-109q-9-52-57-64l-65-12-36 40-36-40Z" fill="#4F79F4"/>
    <path d="M18 374h138v24H18Z" fill="#FFD52E"/><path d="M18 398h138l-16 76H36Z" fill="#FFC928"/><path d="M356 374h138v24H356Z" fill="#FF3545"/><path d="M356 398h138l-16 76H374Z" fill="#F63E46"/><path d="M48 410v43m35-43v43m35-43v43M386 410v43m35-43v43m35-43v43" stroke="#FFF" strokeWidth="12"/>
  </svg>;
  if (type === "contract") return <svg {...common}>
    <path d="M76 54 430 90l-28 366L48 421Z" fill="#E3E6E5"/><path d="M56 30h340q20 0 20 20v400H56q-20 0-20-20V50q0-20 20-20Z" fill="#F4F4F2"/><text x="76" y="114" fontSize="42" fontWeight="700" fill="#F36D5D">CONTRACT</text><path d="M76 145h280" stroke="#87D7F4" strokeWidth="22"/><path d="M76 213h280M76 281h280M76 349h125" stroke="#CCD5DF" strokeWidth="22"/><path d="m236 356 171-176 45 44-171 176-62 18Z" fill="#F36D5D"/><path d="m236 356 45 44-62 18Z" fill="#344B60"/>
  </svg>;
  return <svg {...common}>
    <path d="M102 18h308q32 0 32 32v155q0 32-32 32H300l-44 64-44-64H102q-32 0-32-32V50q0-32 32-32Z" fill="#DCE7F5"/><circle cx="174" cy="128" r="17" fill="#73728D"/><circle cx="256" cy="128" r="17" fill="#73728D"/><circle cx="338" cy="128" r="17" fill="#73728D"/><text x="256" y="398" fontSize="88" fontWeight="900" textAnchor="middle" fill="#F34B91">ABOUT</text><text x="256" y="486" fontSize="88" fontWeight="900" textAnchor="middle" fill="#F34B91">US</text>
  </svg>;
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
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(0.75rem, 3vw, 2rem)" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: tk.isDark ? "rgba(0,0,0,0.66)" : "rgba(0,0,0,0.42)", backdropFilter: "blur(5px)", animation: "fadeOverlay 0.25s ease" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: "920px", height: "min(82vh, 820px)", minHeight: "min(520px, calc(100dvh - 1.5rem))",
        background: tk.isDark ? "rgba(18,16,14,0.99)" : "rgba(253,251,248,0.99)",
        border: `1px solid ${tk.goldBorder}`,
        borderRadius: "24px",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: tk.isDark ? "0 30px 90px rgba(0,0,0,0.65)" : "0 30px 80px rgba(0,0,0,0.2)",
        animation: "rightsModalIn 0.32s cubic-bezier(.22,1,.36,1)",
      }}>
        <style>{`
          @keyframes fadeOverlay { from { opacity: 0 } to { opacity: 1 } }
          @keyframes rightsModalIn { from { transform: translateY(14px) scale(.975); opacity: 0 } to { transform: none; opacity: 1 } }
          @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        `}</style>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${tk.surfaceBorder}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
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
              <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: "6px" }}><TopicIllustration type={t.icon} size={25} /></span>
              {t.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", padding: "0.9rem 1rem", borderRadius: "16px", background: tk.isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", border: `1px solid ${tk.surfaceBorder}` }}>
            <div style={{ width: "76px", height: "76px", flexShrink: 0, display: "grid", placeItems: "center" }}><TopicIllustration type={topic.icon} size={76} /></div>
            <div><h3 style={{ margin: 0, color: tk.textPrimary, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.35rem" }}>{topic.title}</h3><p style={{ margin: "0.35rem 0 0", color: tk.textMuted, fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.8rem", lineHeight: 1.5 }}>Explore the key information for this topic.</p></div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "10px",
                border: `1px solid ${tk.goldBorder}`,
                background: tk.isDark ? "rgba(255,255,255,0.06)" : "#dbd4c9",
                color: tk.textPrimary,
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.03em",
                cursor: "default",
              }}
            >
              Your Rights
            </button>
          </div>
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
              </div>
              <p style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.825rem", color: tk.textSecondary, lineHeight: 1.6, margin: "0 0 0.5rem" }}>
                Based on your document type, we've opened the most relevant section — <strong style={{ color: tk.gold }}>{topic.title}</strong>.
              </p>
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