import express from "express";
import multer from "multer";
import { uploadFile, analyzeText, translateExistingAnalysis, translateContent } from "../controllers/uploadController.js";
import { compareDocuments } from "../controllers/compareController.js";
import { generateDocument } from "../controllers/generateController.js";
import { uploadsDir } from "../utils/uploads.js";

const router = express.Router();

const ALLOWED_EXT = [".pdf", ".docx", ".txt"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = file.originalname?.includes(".")
      ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()
      : "";
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname?.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (!ALLOWED_EXT.includes(ext)) {
      return cb(new Error("Only PDF, DOCX, and TXT files are allowed."));
    }
    cb(null, true);
  },
});

// Error-handling wrapper for multer
const uploadSingle = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File too large. Max size is 10 MB." });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// For compare — accepts 2 files
const uploadPair = (req, res, next) => {
  upload.fields([{ name: "fileA", maxCount: 1 }, { name: "fileB", maxCount: 1 }])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large. Max 10 MB each." });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

router.post("/upload", uploadSingle, uploadFile);
router.post("/analyze-text", analyzeText);
router.post("/compare", uploadPair, compareDocuments);
router.post("/generate", generateDocument);

router.post("/translate-analysis", translateExistingAnalysis);
router.post("/translate-content", translateContent);

export default router;
