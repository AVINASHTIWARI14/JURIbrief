import { query } from "../db/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Legacy register/login handlers — kept only to avoid runtime import errors.
// Actual auth is handled by Supabase client-side; profiles auto-insert via DB trigger.
export async function initUsersTable() { /* no-op — schema managed via schema.sql */ }

export async function createUser() {
  throw new Error("Legacy /api/register is disabled. Use Supabase auth on the frontend.");
}

export async function findUserByEmail(email) {
  const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

// Saare users list karo (admin)
export async function getAllUsers() {
  const result = await query(
    `SELECT id, full_name, email, role, approved, created_at FROM users ORDER BY created_at DESC`
  );
  return result.rows;
}

// Password verify karo
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Admin: approve / revoke dashboard access for a user
export async function setUserApproval(userId, approved) {
  const result = await query(
    `UPDATE users SET approved = $1 WHERE id = $2
     RETURNING id, full_name, email, role, approved, created_at`,
    [approved, userId]
  );
  return result.rows[0] || null;
}

// Admin: match waitlist entry email → flip that user's approved flag
export async function setUserApprovalByEmail(email, approved) {
  const result = await query(
    `UPDATE users SET approved = $1 WHERE email = $2
     RETURNING id, full_name, email, role, approved`,
    [approved, email]
  );
  return result.rows[0] || null;
}