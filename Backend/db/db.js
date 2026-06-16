import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

// Connects to Supabase PostgreSQL using the connection string from
// Supabase Dashboard → Project Settings → Database → Connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const query = (text, params) => pool.query(text, params);

// Verifies the database connection on server startup.
// All table creation is managed via schema.sql — run that in Supabase SQL Editor.
export async function initDB() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection established");
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  }
}
