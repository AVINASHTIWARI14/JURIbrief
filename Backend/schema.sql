-- ============================================================
-- Legal Ease AI — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension (usually pre-enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── USERS ───────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific profile data
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           VARCHAR(255) UNIQUE NOT NULL,
  full_name       VARCHAR(255),
  role            VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  aadhaar_verified BOOLEAN     DEFAULT FALSE,
  approved        BOOLEAN      DEFAULT FALSE,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);


-- ─── DOCUMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         VARCHAR(500),
  source_type   VARCHAR(10) NOT NULL CHECK (source_type IN ('text', 'pdf', 'docx')),
  original_text TEXT,
  file_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ─── DOCUMENT ANALYSES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.document_analyses (
  id                  UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id         UUID       NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id             UUID       NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  summary             TEXT,
  risk_score          INTEGER    CHECK (risk_score >= 0 AND risk_score <= 100),
  highlighted_clauses JSONB      DEFAULT '[]',
  risk_list           JSONB      DEFAULT '[]',
  user_rights         JSONB      DEFAULT '[]',
  model_used          VARCHAR(100),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ─── RISK CLAUSES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.risk_clauses (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id  UUID        NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
  clause_text  TEXT        NOT NULL,
  risk_level   VARCHAR(10) NOT NULL CHECK (risk_level IN ('high', 'medium', 'low')),
  explanation  TEXT,
  position     INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ─── GENERATED DOCUMENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt     TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  format     VARCHAR(10) CHECK (format IN ('txt', 'pdf', 'docx')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ─── CHAT HISTORY ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_history (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  analysis_id UUID        REFERENCES public.document_analyses(id) ON DELETE SET NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ─── DOCUMENT HISTORY (comparisons) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.document_history (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doc_v1_id         UUID        REFERENCES public.documents(id) ON DELETE SET NULL,
  doc_v2_id         UUID        REFERENCES public.documents(id) ON DELETE SET NULL,
  diff_result       JSONB       DEFAULT '{}',
  new_risks         JSONB       DEFAULT '[]',
  negotiation_tips  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ─── WAITLIST ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        VARCHAR(255) UNIQUE NOT NULL,
  full_name    VARCHAR(255) NOT NULL,
  reason       TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID        REFERENCES public.users(id) ON DELETE SET NULL
);

-- CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name    VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  enquiry_type VARCHAR(80),
  message      TEXT        NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_clauses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages  ENABLE ROW LEVEL SECURITY;


-- ─── users policies ──────────────────────────────────────────
CREATE POLICY "users: read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users: update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "admin: full access to users"
  ON public.users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── documents policies ──────────────────────────────────────
CREATE POLICY "documents: select own"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "documents: insert own"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents: update own"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "documents: delete own"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "admin: full access to documents"
  ON public.documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── document_analyses policies ──────────────────────────────
CREATE POLICY "analyses: select own"
  ON public.document_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "analyses: insert own"
  ON public.document_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analyses: update own"
  ON public.document_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "admin: full access to analyses"
  ON public.document_analyses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── risk_clauses policies ───────────────────────────────────
CREATE POLICY "risk_clauses: select via analysis ownership"
  ON public.risk_clauses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.document_analyses da
    WHERE da.id = analysis_id AND da.user_id = auth.uid()
  ));

CREATE POLICY "risk_clauses: insert via analysis ownership"
  ON public.risk_clauses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.document_analyses da
    WHERE da.id = analysis_id AND da.user_id = auth.uid()
  ));

CREATE POLICY "admin: full access to risk_clauses"
  ON public.risk_clauses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── generated_documents policies ────────────────────────────
CREATE POLICY "generated: select own"
  ON public.generated_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "generated: insert own"
  ON public.generated_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "generated: delete own"
  ON public.generated_documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "admin: full access to generated_documents"
  ON public.generated_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── chat_history policies ───────────────────────────────────
CREATE POLICY "chat: select own"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat: insert own"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin: full access to chat_history"
  ON public.chat_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── document_history policies ───────────────────────────────
CREATE POLICY "history: select own"
  ON public.document_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "history: insert own"
  ON public.document_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin: full access to document_history"
  ON public.document_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── waitlist policies ───────────────────────────────────────
-- Anyone can join the waitlist (pre-auth)
CREATE POLICY "waitlist: anyone can insert"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Users can check their own waitlist status by email
CREATE POLICY "waitlist: select own entry"
  ON public.waitlist FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "admin: full access to waitlist"
  ON public.waitlist FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- contact_messages policies
CREATE POLICY "contact_messages: anyone can insert"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin: full access to contact_messages"
  ON public.contact_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));


-- ============================================================
-- TRIGGER: Auto-create user profile on Supabase auth signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
