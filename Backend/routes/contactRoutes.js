import express from "express";
import { query } from "../db/db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

async function ensureContactMessagesTable() {
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await query(`
    CREATE TABLE IF NOT EXISTS public.contact_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      enquiry_type VARCHAR(80),
      message TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

router.post("/contact-messages", async (req, res) => {
  const { name, full_name, email, enquiry, enquiry_type, message } = req.body;
  const resolvedName = (full_name || name || "").trim();
  const resolvedEmail = (email || "").trim();
  const resolvedEnquiry = (enquiry_type || enquiry || "").trim() || null;
  const resolvedMessage = (message || "").trim();

  if (!resolvedName || !resolvedEmail || !resolvedMessage) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }
  if (!/\S+@\S+\.\S+/.test(resolvedEmail)) {
    return res.status(400).json({ error: "Enter a valid email" });
  }

  try {
    await ensureContactMessagesTable();
    const result = await query(
      `INSERT INTO contact_messages (full_name, email, enquiry_type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [resolvedName, resolvedEmail, resolvedEnquiry, resolvedMessage]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("contact message submit error:", err.code, err.message);
    res.status(500).json({ error: "Could not send message right now" });
  }
});

router.get("/contact-messages", requireAdmin, async (req, res) => {
  try {
    await ensureContactMessagesTable();
    const result = await query(
      "SELECT * FROM contact_messages ORDER BY submitted_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("contact messages list error:", err.code, err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/contact-messages/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["new", "read"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await ensureContactMessagesTable();
    const result = await query(
      `UPDATE contact_messages
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("contact message status error:", err.code, err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
