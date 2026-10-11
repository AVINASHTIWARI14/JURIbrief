import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");

  if (!supabaseUrl || !serviceKey || !resendKey || !fromEmail) {
    return json({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, or REMINDER_FROM_EMAIL secret" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  // Dates are interpreted in India Standard Time; the cron runs at 09:00 IST.
  const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const dueDate = new Date(istNow);
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateText = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;

  const { data: reminders, error } = await supabase
    .from("deadline_reminders")
    .select("id,email,deadline_date,original_text")
    .eq("reminder_status", "pending")
    .eq("deadline_date", dueDateText)
    .limit(200);

  if (error) return json({ error: error.message }, 500);

  const results = [];
  for (const reminder of reminders || []) {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [reminder.email],
        subject: "JURIbrief reminder: deadline tomorrow",
        text: `Your deadline is tomorrow ( ${reminder.deadline_date} ).\n\nReminder for:\n${reminder.original_text}\n\nThis is an automated reminder from JURIbrief.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;line-height:1.6"><h2 style="color:#9b7a2b">🔔 JURIbrief Deadline Reminder</h2><p>You have a deadline tomorrow: <strong>${escapeHtml(reminder.deadline_date)}</strong>.</p><p><strong>Original item:</strong></p><blockquote style="border-left:4px solid #c1a362;padding:8px 14px;background:#f8f5ed;margin:0;white-space:pre-wrap">${escapeHtml(reminder.original_text)}</blockquote><p>Please review the original document and confirm the exact requirement.</p><p style="font-size:12px;color:#666">Automated reminder from JURIbrief.</p></div>`,
      }),
    });

    const body = await emailResponse.json().catch(() => ({}));
    if (emailResponse.ok) {
      const { error: updateError } = await supabase.from("deadline_reminders")
        .update({ reminder_status: "sent", sent_at: new Date().toISOString(), last_error: null })
        .eq("id", reminder.id).eq("reminder_status", "pending");
      results.push({ id: reminder.id, sent: !updateError, error: updateError?.message });
    } else {
      await supabase.from("deadline_reminders")
        .update({ reminder_status: "failed", last_error: String(body.message || body.error || emailResponse.status) })
        .eq("id", reminder.id).eq("reminder_status", "pending");
      results.push({ id: reminder.id, sent: false, error: body.message || body.error || emailResponse.status });
    }
  }

  return json({ processed: results.length, results });
});

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char] as string));
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
