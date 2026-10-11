# JURIbrief deadline reminder setup

The dashboard code and reminder infrastructure are committed, but email delivery will not work until the Supabase migration, Edge Function, Vault secrets, and Resend sender are configured.

## 1. Apply the database migration

From the repository root, with the Supabase CLI linked to the existing JURIbrief project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

If you manage SQL manually, run `supabase/migrations/202610110001_deadline_reminders.sql` in the Supabase SQL Editor. Confirm that the `deadline_reminders` table and the cron job are created. The migration expects the Supabase `pg_cron`, `pg_net`, and Vault extensions to be available.

## 2. Configure Resend

Create a Resend API key and verify a sender domain. Use a sender such as `JURIbrief Reminders <reminders@your-verified-domain.com>`. Do not use an unverified sender in production.

## 3. Set Edge Function secrets

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set REMINDER_FROM_EMAIL="JURIbrief Reminders <reminders@your-verified-domain.com>"
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Never put the service role key or Resend key in frontend code or commit them to GitHub.

## 4. Deploy the Edge Function

```bash
supabase functions deploy send-deadline-reminders --no-verify-jwt
```

The function verifies the service-role bearer token itself. The cron job invokes it daily at 09:00 India Standard Time (03:30 UTC).

## 5. Add two secrets to Supabase Vault

The SQL cron job reads these values from Vault. In Supabase Dashboard → Database → Vault, create:

- `project_url`: `https://YOUR_PROJECT_REF.supabase.co`
- `service_role_key`: your project's service-role key

Never share or commit the service-role key. After saving both values, check Database → Cron Jobs and confirm `juri-send-deadline-reminders` is enabled.

## 6. Test

1. Sign in with an account whose email you can access.
2. Analyze a document that contains a clearly detected future date.
3. Click **Notify** next to that deadline.
4. Confirm a `pending` row exists in `deadline_reminders`.
5. To test delivery immediately, invoke the Edge Function manually with the service-role bearer token and temporarily set a test reminder's `deadline_date` to tomorrow (India date). Restore/clean up test rows afterward.
6. Check the Edge Function logs and Resend email logs.

## Behavior and limits

- Reminders are sent at 09:00 IST on the calendar day before the deadline.
- The email includes the deadline date and the original label/timing/description text.
- A unique index prevents duplicate rows for the same user, date, and original text.
- The Notify button only works when the model returns a parseable date in `date`, `deadlineDate`, `dueDate`, `due_date`, `timing`, or `label`. Relative phrases such as “within 30 days” are not automatically converted into an exact date; the UI will ask for a clear date.
- Email delivery is not active until the migration, Vault, Resend, and function deployment steps above are completed.
