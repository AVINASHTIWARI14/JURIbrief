-- JURIbrief deadline reminder storage.
create table if not exists public.deadline_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  deadline_date date not null,
  original_text text not null,
  reminder_status text not null default 'pending'
    check (reminder_status in ('pending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists deadline_reminders_dedupe
  on public.deadline_reminders (user_id, deadline_date, original_text);

create index if not exists deadline_reminders_due
  on public.deadline_reminders (reminder_status, deadline_date);

alter table public.deadline_reminders enable row level security;

drop policy if exists "Users can view their own deadline reminders" on public.deadline_reminders;
create policy "Users can view their own deadline reminders"
  on public.deadline_reminders for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can create their own deadline reminders" on public.deadline_reminders;
create policy "Users can create their own deadline reminders"
  on public.deadline_reminders for insert
  to authenticated with check (auth.uid() = user_id and email = (select email from auth.users where id = auth.uid()));

drop policy if exists "Users can update their own pending deadline reminders" on public.deadline_reminders;
create policy "Users can update their own pending deadline reminders"
  on public.deadline_reminders for update
  to authenticated using (auth.uid() = user_id and reminder_status = 'pending')
  with check (auth.uid() = user_id and reminder_status in ('pending', 'cancelled'));

grant select, insert, update on public.deadline_reminders to authenticated;

-- Scheduled invocation runs at 09:00 India Standard Time (03:30 UTC).
-- Before enabling this job, add these Supabase Vault secrets:
--   project_url       = https://YOUR_PROJECT_REF.supabase.co
--   service_role_key  = YOUR_SUPABASE_SERVICE_ROLE_KEY
-- Then run the cron.schedule block below.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

select cron.unschedule(jobid)
from cron.job
where jobname = 'juri-send-deadline-reminders';

select cron.schedule(
  'juri-send-deadline-reminders',
  '30 3 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/send-deadline-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := jsonb_build_object('source', 'supabase-cron')
  );
  $$
);
