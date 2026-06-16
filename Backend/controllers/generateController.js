export const generateDocument = async (req, res) => {
  try {
    const { description, documentType, jurisdiction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!description || description.trim().length < 20) {
      return res.status(400).json({ error: "Please describe what you need in at least 20 characters." });
    }
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    const prompt = `You are an expert legal document drafter. Generate a complete, professional, jurisdiction-aware legal document based on the user's requirements.

User requirements:
${description}

Document type: ${documentType || "Infer from the description"}
Jurisdiction: ${jurisdiction || "India (default)"}

Rules:
- Write the FULL document text, ready to be reviewed and signed.
- Use proper legal section numbering (1., 2., 3., etc.) with clear titled headings in ALL CAPS.
- Include all standard clauses a lawyer would expect in this type of document.
- Use [BRACKETS] as placeholders for information the user must fill in later (e.g., [PARTY NAME], [DATE], [ADDRESS], [AMOUNT]).
- Use formal legal language but keep it readable.
- Include jurisdiction-appropriate references (governing law, dispute resolution, etc.).
- End with signature blocks for all parties.
- Do NOT include any commentary, markdown fences, explanations, or notes — return ONLY the raw document text.`;

    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
    });

    let lastErr = "";
    let lastStatus = 0;
    for (const model of models) {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body,
          signal: AbortSignal.timeout(40000),
        }
      );
      if (r.ok) {
        const data = await r.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const cleaned = raw.replace(/```[a-z]*\n?/g, "").replace(/```\n?/g, "").trim();
        if (cleaned) return res.json({ document: cleaned, documentType, jurisdiction: jurisdiction || "India" });
        lastErr = "Empty response";
        continue;
      }
      lastStatus = r.status;
      lastErr = await r.text().catch(() => "");
      if (r.status !== 429 && r.status !== 503) break;
    }

    if (lastStatus === 429) return res.status(429).json({ error: "Rate limit hit. Please wait a minute and try again." });
    res.status(500).json({ error: "Could not generate document. Please try again." });
  } catch (err) {
    console.error("generateDocument error:", err);
    res.status(500).json({ error: "Generation failed: " + err.message });
  }
};
