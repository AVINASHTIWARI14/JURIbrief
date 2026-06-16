import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

function parseJSON(rawText) {
  try { return JSON.parse(rawText); }
  catch {
    const s = rawText.indexOf("{"), e = rawText.lastIndexOf("}");
    if (s === -1 || e === -1) throw new Error("AI returned invalid JSON");
    return JSON.parse(rawText.slice(s, e + 1));
  }
}

async function extractText(filePath, originalName) {
  const ext = path.extname(originalName || filePath).toLowerCase();
  if (ext === ".pdf") {
    const buf = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buf });
    try { const r = await parser.getText(); return r.text; }
    finally { await parser.destroy(); }
  }
  if (ext === ".docx") return (await mammoth.extractRawText({ path: filePath })).value;
  if (ext === ".txt") return fs.readFileSync(filePath, "utf8");
  throw new Error("Supported formats: PDF, DOCX, TXT");
}

async function geminiCompare(textA, textB, apiKey) {
  const prompt = `You are a legal document comparison expert. Compare two versions of a legal document (Version A = older, Version B = newer) and respond ONLY with valid JSON.

Return this exact JSON structure:
{
  "summary": "2-3 sentence overview of what changed from A to B",
  "favorsTenant": "A | B | neutral (which version is better for the weaker party / user)",
  "newClauses": [
    { "title": "Short name", "description": "What clause was added in B", "impact": "good | bad | neutral" }
  ],
  "removedClauses": [
    { "title": "Short name", "description": "What clause was removed from A", "impact": "good | bad | neutral" }
  ],
  "changedClauses": [
    { "title": "Short name", "versionA": "How it read in A", "versionB": "How it reads in B", "impact": "good | bad | neutral" }
  ],
  "newRisks": ["Risk 1 introduced in B", "Risk 2"],
  "recommendation": "Overall recommendation — should user accept B, push back on it, etc."
}

Rules:
- impact: "good" = user-friendly change, "bad" = worse for user, "neutral" = no real difference
- Max 5 items per array
- Use plain English, no legal jargon
- If A and B are nearly identical, return short arrays and say so in summary
- Empty arrays [] when nothing changed in that category

=== VERSION A (older) ===
${textA.substring(0, 6000)}

=== VERSION B (newer) ===
${textB.substring(0, 6000)}`;

  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
  });

  let lastErr = "";
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
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return parseJSON(cleaned);
    }
    lastErr = await r.text().catch(() => "");
    if (r.status !== 429 && r.status !== 503) break;
  }
  throw new Error("Comparison failed: " + lastErr.slice(0, 200));
}

export const compareDocuments = async (req, res) => {
  const files = req.files || {};
  const fileA = files.fileA?.[0];
  const fileB = files.fileB?.[0];

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    let textA = req.body.textA;
    let textB = req.body.textB;

    if (fileA) textA = await extractText(fileA.path, fileA.originalname);
    if (fileB) textB = await extractText(fileB.path, fileB.originalname);

    if (!textA?.trim() || !textB?.trim()) {
      return res.status(400).json({ error: "Both documents are required" });
    }

    const comparison = await geminiCompare(textA, textB, apiKey);
    res.json({ comparison });
  } catch (err) {
    console.error("compareDocuments error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (fileA?.path && fs.existsSync(fileA.path)) fs.unlinkSync(fileA.path);
    if (fileB?.path && fs.existsSync(fileB.path)) fs.unlinkSync(fileB.path);
  }
};
