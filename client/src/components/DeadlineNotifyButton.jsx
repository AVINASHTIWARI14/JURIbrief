import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function normalizeDate(value) {
  if (!value) return "";
  const raw = String(value).trim();
  // Accept ISO dates and common dates such as 16 Oct 2026 / October 16, 2026.
  const iso = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function DeadlineNotifyButton({ deadline, tk }) {
  const { user } = useAuth();
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  const dateValue = deadline?.date || deadline?.deadlineDate || deadline?.dueDate || deadline?.due_date;
  const deadlineDate = normalizeDate(dateValue);
  const originalText = [
    deadline?.label,
    deadline?.timing,
    deadline?.description,
  ].filter(Boolean).join(" — ").slice(0, 4000);

  const scheduleReminder = async () => {
    if (!user?.id || !user?.email) {
      setState("error");
      setMessage("Please sign in again to schedule a reminder.");
      return;
    }
    if (!deadlineDate) {
      setState("error");
      setMessage("A clear deadline date was not detected for this item.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${deadlineDate}T00:00:00`);
    if (Number.isNaN(target.getTime()) || target <= today) {
      setState("error");
      setMessage("Choose a future deadline to receive a reminder one day before it.");
      return;
    }

    setState("saving");
    setMessage("");
    const { error } = await supabase.from("deadline_reminders").upsert({
      user_id: user.id,
      email: user.email,
      deadline_date: deadlineDate,
      original_text: originalText || deadlineDate,
      reminder_status: "pending",
    }, { onConflict: "user_id,deadline_date,original_text" });

    if (error) {
      console.error("Deadline reminder save failed:", error);
      setState("error");
      setMessage(error.message?.includes("deadline_reminders")
        ? "Reminder storage is not set up yet. Run the Supabase migration first."
        : "Could not save the reminder. Please try again.");
      return;
    }
    setState("saved");
    setMessage(`Reminder scheduled for ${new Date(new Date(`${deadlineDate}T00:00:00`).getTime() - 86400000).toLocaleDateString()} (one day before).`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.3rem", marginTop: "0.65rem" }}>
      <button
        type="button"
        onClick={scheduleReminder}
        disabled={state === "saving" || state === "saved"}
        aria-label="Notify me one day before this deadline"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.45rem",
          border: `1px solid ${tk.goldBorder || tk.gold}`, borderRadius: "9px",
          background: state === "saved" ? "rgba(16,185,129,0.12)" : (tk.isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)"),
          color: state === "saved" ? "#059669" : tk.textPrimary,
          padding: "0.35rem 0.7rem", cursor: state === "saving" || state === "saved" ? "default" : "pointer",
          fontFamily: "'Roboto Serif', Georgia, serif", fontSize: "0.78rem", fontWeight: 700,
          opacity: state === "saving" ? 0.7 : 1,
        }}
      >
        <img src="/deadline-bell.png" alt="" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
        {state === "saving" ? "Scheduling…" : state === "saved" ? "Reminder set" : "Notify"}
      </button>
      {message && <span role={state === "error" ? "alert" : "status"} style={{ fontSize: "0.72rem", lineHeight: 1.45, color: state === "error" ? "#DC2626" : "#059669" }}>{message}</span>}
    </div>
  );
}
