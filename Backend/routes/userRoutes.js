import express from "express";
import { getAllUsers, setUserApproval } from "../models/userModel.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Note: Registration & login are handled entirely by Supabase on the frontend.
// These admin endpoints are protected client-side via role check in ProtectedRoute.

// GET /api/users — frontend role check handles access
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/users/:id/approval — admin toggles dashboard access
router.patch("/users/:id/approval", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  if (typeof approved !== "boolean") {
    return res.status(400).json({ error: "approved (boolean) is required" });
  }
  try {
    const user = await setUserApproval(id, approved);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
