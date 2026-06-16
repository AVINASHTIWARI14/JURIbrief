import express from "express";
import { query } from "../db/db.js";
import { setUserApprovalByEmail } from "../models/userModel.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/joinwaitlist", async (req, res) => {
  const { full_name, name, email } = req.body;
  const resolvedName = full_name || name;

  if (!resolvedName || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const result = await query(
      "INSERT INTO waitlist (full_name, email) VALUES ($1, $2) RETURNING *",
      [resolvedName, email]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("joinwaitlist error:", err.code, err.message, err.detail || "");
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.get("/waitlist", requireAdmin, async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM waitlist ORDER BY submitted_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/waitlist/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await query(
      `UPDATE waitlist
       SET status = $1::varchar(20),
           reviewed_at = CASE WHEN $1::text = 'pending' THEN NULL ELSE NOW() END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Waitlist entry not found" });
    }

    // Flip the linked user's dashboard access flag (safe no-op if no matching user)
    const entry = result.rows[0];
    try {
      if (status === "approved") await setUserApprovalByEmail(entry.email, true);
      else if (status === "rejected") await setUserApprovalByEmail(entry.email, false);
    } catch (syncErr) {
      console.error("User approval sync warning:", syncErr.message);
    }

    res.json({ success: true, data: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/waitlist/claim-approved-access", requireAuth, async (req, res) => {
  const email = req.authUser?.email;
  const userId = req.authUser?.id;

  if (!email || !userId) {
    return res.status(400).json({ error: "Authenticated user details missing" });
  }

  try {
    const waitlistRes = await query(
      "SELECT status FROM waitlist WHERE LOWER(email) = LOWER($1) ORDER BY submitted_at DESC LIMIT 1",
      [email]
    );
    const status = waitlistRes.rows[0]?.status;

    if (status !== "approved") {
      return res.json({ success: true, claimed: false, approved: false });
    }

    const userRes = await query(
      `UPDATE users
       SET approved = true
       WHERE id = $1
       RETURNING id, full_name, email, role, approved, created_at`,
      [userId]
    );

    res.json({
      success: true,
      claimed: true,
      approved: true,
      data: userRes.rows[0] || null,
    });
  } catch (err) {
    console.error("claim-approved-access error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/waitlist/check?email=... — returns whether this email is approved on the waitlist.
// Called by the frontend right after sign-up so pre-approved users get instant dashboard access.
router.get("/waitlist/check", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "email query param required" });

  try {
    const result = await query(
      "SELECT status FROM waitlist WHERE LOWER(email) = LOWER($1) ORDER BY submitted_at DESC LIMIT 1",
      [email]
    );
    const status = result.rows[0]?.status || null;
    res.json({ success: true, status, approved: status === "approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/waitlist/status?email=... — rich status for the waitlist page (position in line, timestamps)
router.get("/waitlist/status", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "email query param required" });

  try {
    const entryRes = await query(
      "SELECT * FROM waitlist WHERE LOWER(email) = LOWER($1) ORDER BY submitted_at DESC LIMIT 1",
      [email]
    );
    const entry = entryRes.rows[0];

    if (!entry) {
      return res.json({ success: true, onWaitlist: false });
    }

    // Position = how many pending entries submitted BEFORE this one (lower is sooner)
    let position = null;
    if (entry.status === "pending" || !entry.status) {
      const posRes = await query(
        "SELECT COUNT(*) FROM waitlist WHERE status = 'pending' AND submitted_at < $1",
        [entry.submitted_at]
      );
      position = parseInt(posRes.rows[0].count, 10) + 1;
    }

    res.json({
      success: true,
      onWaitlist: true,
      status: entry.status || "pending",
      submittedAt: entry.submitted_at,
      reason: entry.reason || null,
      fullName: entry.full_name || entry.name || null,
      position,
    });
  } catch (err) {
    console.error("waitlist status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/waitlist/bulk — approve or deny multiple entries at once
router.patch("/waitlist/bulk", requireAdmin, async (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids (array) is required" });
  }
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status must be approved or rejected" });
  }

  try {
    const result = await query(
      `UPDATE waitlist SET status = $1::varchar(20), reviewed_at = NOW()
       WHERE id = ANY($2::int[]) RETURNING *`,
      [status, ids]
    );

    // Sync all matching user rows
    for (const entry of result.rows) {
      try {
        await setUserApprovalByEmail(entry.email, status === "approved");
      } catch {}
    }

    res.json({ success: true, updated: result.rows.length, data: result.rows });
  } catch (err) {
    console.error("bulk update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
