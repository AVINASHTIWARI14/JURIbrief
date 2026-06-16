const SYSTEM_PROMPT = `You are Juri, the AI legal assistant for Legal Ease AI — a platform that analyzes legal documents (contracts, leases, NDAs, terms of service, etc.) and explains them in plain English.

Your job is to help users:
1. Understand how to use the Legal Ease AI platform
2. Understand legal concepts, clauses, and terminology
3. Ask follow-up questions about a document they have already analyzed
4. Get negotiation and contract advice

Strict rules:
- Only answer questions related to Legal Ease AI, the user's analyzed document (if provided), or general legal knowledge.
- If the user asks something off-topic (politics, coding, cooking, personal opinions, etc.), politely redirect: "I can only help with legal documents and Legal Ease AI. What would you like to know?"
- Keep responses concise — 2 to 4 sentences unless the user asks for detail.
- Use simple, plain language. Avoid legal jargon unless explaining it.
- Always add this short disclaimer when giving legal interpretation: "This is informational only, not legal advice."
- If the user asks about their document but no document context is provided in this session, reply: "I don't see an analyzed document yet. Please analyze one first and I'll answer questions about it."

Be warm, helpful, and direct. You are a trusted assistant, not a chatbot.`;

const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi (हिन्दी)", bn: "Bengali (বাংলা)",
  te: "Telugu (తెలుగు)", mr: "Marathi (मराठी)", ta: "Tamil (தமிழ்)",
  gu: "Gujarati (ગુજરાતી)", kn: "Kannada (ಕನ್ನಡ)", ml: "Malayalam (മലയാളം)",
  pa: "Punjabi (ਪੰਜਾਬੀ)", or: "Odia (ଓଡ଼ିଆ)", ur: "Urdu (اردو)",
};

function buildContextBlock(context) {
  if (!context || (!context.analysis && !context.documentText)) return "";
  const parts = ["\n\n=== USER'S ANALYZED DOCUMENT CONTEXT ==="];
  if (context.analysis?.documentType) parts.push(`Document type: ${context.analysis.documentType}`);
  if (context.analysis?.riskScore !== undefined) parts.push(`Risk score: ${context.analysis.riskScore}/100`);
  if (context.analysis?.summary) parts.push(`Summary: ${context.analysis.summary}`);
  if (context.analysis?.criticalThreats?.length) {
    parts.push(`\nCritical risks found:`);
    context.analysis.criticalThreats.forEach((t, i) => parts.push(`${i + 1}. ${t.title} — ${t.description}`));
  }
  if (context.analysis?.moderateThreats?.length) {
    parts.push(`\nModerate risks found:`);
    context.analysis.moderateThreats.forEach((t, i) => parts.push(`${i + 1}. ${t.title} — ${t.description}`));
  }
  if (context.documentText) parts.push(`\nOriginal document excerpt:\n${context.documentText.substring(0, 3000)}`);
  parts.push("=== END OF CONTEXT ===\n");
  return parts.join("\n");
}

export const chatWithJuri = async (req, res) => {
  try {
    const { message, history = [], context, language = "en" } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!message || !message.trim()) return res.status(400).json({ error: "Message is required" });
    if (!geminiApiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });

    // Add language instruction to system prompt
    const langName = LANGUAGE_NAMES[language] || "English";
    const langInstruction = language === "en"
      ? ""
      : `\n\nIMPORTANT: Always respond in ${langName}. The user prefers ${langName}. Even if the user writes in English, reply in ${langName}.`;

    const systemInstruction = SYSTEM_PROMPT + langInstruction + buildContextBlock(context);

    const contents = [];
    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const primary = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash-lite")
      .split(",").map(m => m.trim()).filter(Boolean);
    const models = [...new Set([primary, ...fallbacks])];

    const requestBody = JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    });

    let lastStatus = 0, lastError = "";

    for (const model of models) {
      let response;
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": geminiApiKey },
            body: requestBody,
            signal: AbortSignal.timeout(25000),
          }
        );
      } catch (netErr) { lastError = netErr.message; continue; }

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        if (reply) return res.json({ reply });
        lastError = "Empty response"; continue;
      }

      lastStatus = response.status;
      lastError = await response.text().catch(() => "");
      if (response.status !== 429 && response.status !== 503) break;
    }

    if (lastStatus === 429) return res.status(429).json({ error: "Juri has hit the free-tier rate limit. Please wait a minute." });
    if (lastStatus === 503) return res.status(503).json({ error: "Juri is temporarily overloaded. Please try again shortly." });
    return res.status(500).json({ error: "Juri couldn't respond right now. Please try again." });
  } catch (err) {
    console.error("chatWithJuri error:", err);
    res.status(500).json({ error: "Chat failed: " + err.message });
  }
};