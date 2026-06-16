import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables"
  );
}

// Service-role client — bypasses RLS for server-side operations.
// Never expose this key to the frontend.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
