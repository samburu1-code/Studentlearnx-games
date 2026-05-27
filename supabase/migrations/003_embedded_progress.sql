-- Embedded-mode student progress (when the games are loaded via iframe from
-- studentlearnx.com). Students are identified by their main-site email; no
-- Supabase auth user is needed because the parent site handles login.

CREATE TABLE IF NOT EXISTS public.embedded_students (
  student_email TEXT PRIMARY KEY,
  student_name  TEXT,
  total_xp      INTEGER NOT NULL DEFAULT 0,
  level         INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.embedded_game_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email   TEXT NOT NULL REFERENCES public.embedded_students(student_email) ON DELETE CASCADE,
  grade           INTEGER NOT NULL,
  subject         TEXT NOT NULL,
  topic           TEXT,
  topic_slug      TEXT NOT NULL,
  game_number     INTEGER NOT NULL,
  score           INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  stars           INTEGER NOT NULL,
  medal           TEXT,
  xp_earned       INTEGER NOT NULL,
  best_streak     INTEGER NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_embedded_sessions_lookup
  ON public.embedded_game_sessions (student_email, grade, subject, topic_slug);

CREATE TABLE IF NOT EXISTS public.embedded_topic_progress (
  student_email   TEXT NOT NULL REFERENCES public.embedded_students(student_email) ON DELETE CASCADE,
  grade           INTEGER NOT NULL,
  subject         TEXT NOT NULL,
  topic_slug      TEXT NOT NULL,
  games_completed INTEGER NOT NULL DEFAULT 0,
  total_stars     INTEGER NOT NULL DEFAULT 0,
  max_stars       INTEGER NOT NULL DEFAULT 0,
  xp_earned       INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_email, grade, subject, topic_slug)
);

-- RLS off — API routes handle access. The service role used in routes is the
-- only writer; reads are filtered by email in the API.
ALTER TABLE public.embedded_students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedded_game_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedded_topic_progress  ENABLE ROW LEVEL SECURITY;

-- Allow anon to read (filtered by email server-side via API). Write happens
-- only through service-role API route.
CREATE POLICY "embedded_students_read"
  ON public.embedded_students FOR SELECT USING (true);
CREATE POLICY "embedded_sessions_read"
  ON public.embedded_game_sessions FOR SELECT USING (true);
CREATE POLICY "embedded_topic_progress_read"
  ON public.embedded_topic_progress FOR SELECT USING (true);
