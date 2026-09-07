import express from "express";
import { getAllUsers, setUserApproval } from "../models/userModel.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("GET /api/users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/users/:id/approval
router.patch("/users/:id/approval", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;

  if (typeof approved !== "boolean") {
    return res.status(400).json({
      error: "approved (boolean) is required",
    });
  }

  // Admin cannot revoke their own access
  if (String(req.authUser?.id) === String(id)) {
    return res.status(400).json({
      error: "The admin account cannot be revoked from the admin dashboard.",
    });
  }

  try {
    const user = await setUserApproval(id, approved);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(
      `[ADMIN] ${approved ? "Granted" : "Revoked"} dashboard access for ${user.email}`
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("PATCH /api/users/:id/approval error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;