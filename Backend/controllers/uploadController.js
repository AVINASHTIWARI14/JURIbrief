import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const require = createRequire(import.meta.url);
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs")
).href;

// Extract text from PDF buffer using pdfjs-dist
async function extractPdfText(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

function parseAnalysisResponse(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI returned an invalid response format");
    }
    return JSON.parse(rawText.slice(start, end + 1));
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGeminiModels() {
  const primary = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbackModels = (
    process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash-lite"
  )
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([primary, ...fallbackModels])];
}

async function requestGeminiAnalysis(model, geminiApiKey, body) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey,
          },
          body,
          signal: AbortSignal.timeout(30000),
        }
      );
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
      await sleep(1200 * attempt);
    }
  }
  throw new Error(
    `Gemini request failed: ${lastError?.message || "network error"}`
  );
}

// STEP 1: Always analyze in English for consistent scoring
async function analyzeInEnglish(documentText, geminiApiKey) {
  const prompt = `You are a legal document analyst. Analyze the following legal document and respond ONLY with valid JSON (no markdown, no backticks, no extra text).

Return this exact JSON structure:
{
  "documentType": "Type of document e.g. Rental Agreement, NDA, Employment Contract",
  "riskScore": 0,
  "summary": "A plain-English summary of what this document is about (2-4 sentences)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "moderateThreats": [
    { "title": "Short threat title", "description": "What this clause means and why it matters", "quote": "Exact quote from document if available" }
  ],
  "criticalThreats": [
    { "title": "Short threat title", "description": "What this clause means and why it is dangerous", "quote": "Exact quote from document if available" }
  ],
  "negotiationTips": ["Tip 1", "Tip 2"],
  "deadlines": [
    { "label": "Short name", "timing": "When it happens", "description": "What it means for the user", "urgency": "high | medium | low" }
  ]
}

Rules:
- documentType: identify the type of legal document in 2-4 words
- riskScore: integer 0-100. 0-30 = low risk, 31-60 = moderate, 61-85 = high, 86-100 = critical
- moderateThreats = yellow level risks (unfavorable but not catastrophic)
- criticalThreats = red level risks (seriously harmful, must be flagged urgently)
- negotiationTips = 2-4 actionable tips
- deadlines: extract all dates, notice periods, expiry clauses. Empty array [] if none found.
- If no threats found, return empty arrays []
- Keep language simple and understandable for non-lawyers
- Quote directly from document where possible

DOCUMENT:
${documentText.substring(0, 8000)}`;

  const models = getGeminiModels();
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
  });

  let lastModelError,
    lastStatus = 0;

  for (const model of models) {
    const response = await requestGeminiAnalysis(model, geminiApiKey, requestBody);
    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      return parseAnalysisResponse(cleaned);
    }
    const errText = await response.text();
    lastModelError = errText;
    lastStatus = response.status;
    if (response.status !== 503 && response.status !== 429) break;
  }

  const isDailyQuota =
    /free_tier_requests|RESOURCE_EXHAUSTED|GenerateRequestsPerDay/i.test(
      lastModelError || ""
    );
  if (lastStatus === 429 && isDailyQuota) {
    const err = new Error(
      "Daily AI quota exhausted. Please try again tomorrow or enable billing."
    );
    err.status = 429;
    throw err;
  }
  if (lastStatus === 429) {
    const err = new Error("Too many requests. Please wait a minute.");
    err.status = 429;
    throw err;
  }
  if (lastStatus === 503) {
    const err = new Error("Gemini is temporarily overloaded. Please try again.");
    err.status = 503;
    throw err;
  }
  throw new Error("Analysis service unavailable. Please try again.");
}

// STEP 2: Translate the English analysis into target language (score stays same)
async function translateAnalysis(analysis, geminiApiKey, targetLang) {
  if (targetLang === "en") return analysis;

  const languageNames = {
    hi: "Hindi (हिन्दी)",
    bn: "Bengali (বাংলা)",
    te: "Telugu (తెలుగు)",
    mr: "Marathi (मराठी)",
    ta: "Tamil (தமிழ்)",
    gu: "Gujarati (ગુજراتী)",
    kn: "Kannada (ಕನ್ನಡ)",
    ml: "Malayalam (മലയാളം)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
    or: "Odia (ଓଡ଼ିଆ)",
    ur: "Urdu (اردو)",
  };
  const langName = languageNames[targetLang] || "Hindi";

  const prompt = `Translate ONLY the text values in this JSON object to ${langName}. 
CRITICAL RULES:
- Keep ALL JSON keys in English exactly as they are
- Keep riskScore as the same number (do NOT translate numbers)
- Keep urgency values (high/medium/low) in English
- Translate: summary, keyPoints array items, moderateThreats titles/descriptions, criticalThreats titles/descriptions, negotiationTips items, deadlines label/timing/description, documentType
- Return ONLY valid JSON, no markdown, no backticks

JSON to translate:
${JSON.stringify(analysis)}`;

  const models = getGeminiModels();
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
  });

  for (const model of models) {
    try {
      const response = await requestGeminiAnalysis(model, geminiApiKey, requestBody);
      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const translated = parseAnalysisResponse(cleaned);
        translated.riskScore = analysis.riskScore;
        return translated;
      }
    } catch {
      // If translation fails, return English version silently
    }
  }
  return analysis;
}

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const extension = path
      .extname(req.file.originalname || filePath)
      .toLowerCase();
    const responseLanguage = req.body.language || "en";
    let text = "";

    if (extension === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      text = await extractPdfText(dataBuffer);
    } else if (extension === ".txt") {
      text = fs.readFileSync(filePath, "utf8");
    } else if (extension === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      return res.status(400).json({ error: "Supported formats: PDF, DOCX, TXT" });
    }

    if (!geminiApiKey)
      return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
    if (!text.trim())
      return res.status(400).json({
        error: "Could not extract readable text from the uploaded file",
      });

    const englishAnalysis = await analyzeInEnglish(text, geminiApiKey);
    const analysis = await translateAnalysis(englishAnalysis, geminiApiKey, responseLanguage);

    res.json({
      message: "File processed successfully",
      text: text.substring(0, 500),
      analysis,
      englishAnalysis,
    });
  } catch (error) {
    console.error("uploadFile error:", error);
    const status = error.status || 500;
    res.status(status).json({
      error:
        status === 500
          ? "Error processing file: " + error.message
          : error.message,
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);
  }
};

export const analyzeText = async (req, res) => {
  try {
    const { text, language: responseLanguage = "en" } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!text || text.trim().length < 50)
      return res.status(400).json({ error: "Please provide at least 50 characters of text" });
    if (!geminiApiKey)
      return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });

    const englishAnalysis = await analyzeInEnglish(text, geminiApiKey);
    const analysis = await translateAnalysis(englishAnalysis, geminiApiKey, responseLanguage);

    res.json({ message: "Text analyzed successfully", analysis, englishAnalysis });
  } catch (error) {
    console.error("analyzeText error:", error);
    const status = error.status || 500;
    res.status(status).json({
      error:
        status === 500
          ? "Error analyzing text: " + error.message
          : error.message,
    });
  }
};

// Translate already-analyzed JSON to a new language (no re-analysis)
export const translateExistingAnalysis = async (req, res) => {
  try {
    const { analysis, language } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!analysis || !language)
      return res.status(400).json({ error: "analysis and language required" });
    if (!geminiApiKey)
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    if (language === "en") return res.json({ analysis });

    const translated = await translateAnalysis(analysis, geminiApiKey, language);
    res.json({ analysis: translated });
  } catch (error) {
    console.error("translateExistingAnalysis error:", error);
    res.status(500).json({ error: "Translation failed: " + error.message });
  }
};

// Translate arbitrary text content (for SmartBook)
export const translateContent = async (req, res) => {
  try {
    const { content, language } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!content || !language)
      return res.status(400).json({ error: "content and language required" });
    if (!geminiApiKey)
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    if (language === "en") return res.json({ content });

    const LANGUAGE_NAMES = {
      hi: "Hindi (हिन्दी)",
      bn: "Bengali (বাংলা)",
      te: "Telugu (తెలుగు)",
      mr: "Marathi (मराठी)",
      ta: "Tamil (தமிழ்)",
      gu: "Gujarati (ગુજरातী)",
      kn: "Kannada (ಕನ್ನಡ)",
      ml: "Malayalam (മലയാളം)",
      pa: "Punjabi (ਪੰਜਾਬੀ)",
      or: "Odia (ଓਡ਼ਿਆ)",
      ur: "Urdu (اردو)",
    };
    const langName = LANGUAGE_NAMES[language] || "Hindi";

    const prompt = `Translate the following JSON array to ${langName}. Keep JSON keys ("head", "body") in English. Return ONLY valid JSON array, no markdown.\n\n${JSON.stringify(content)}`;
    const models = getGeminiModels();
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
    });

    for (const model of models) {
      const response = await requestGeminiAnalysis(model, geminiApiKey, requestBody);
      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return res.json({ content: JSON.parse(cleaned) });
      }
    }
    res.status(500).json({ error: "Translation failed" });
  } catch (error) {
    console.error("translateContent error:", error);
    res.status(500).json({ error: "Translation failed: " + error.message });
  }
};
