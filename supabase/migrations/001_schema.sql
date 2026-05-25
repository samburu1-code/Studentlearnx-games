-- ============================================================
-- StudentLearnX Games — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID    REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name  TEXT,
  total_xp      INTEGER NOT NULL DEFAULT 0,
  level         INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE  USING (auth.uid() = id);

-- ── game_sessions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grade           INTEGER     NOT NULL,
  subject         TEXT        NOT NULL,
  topic           TEXT        NOT NULL,
  topic_slug      TEXT        NOT NULL,
  game_number     INTEGER     NOT NULL,
  score           INTEGER     NOT NULL,
  total_questions INTEGER     NOT NULL DEFAULT 10,
  stars           INTEGER     NOT NULL CHECK (stars BETWEEN 0 AND 3),
  medal           TEXT        NOT NULL CHECK (medal IN ('gold','silver','bronze','none')),
  xp_earned       INTEGER     NOT NULL DEFAULT 0,
  best_streak     INTEGER     NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own" ON public.game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── topic_progress ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grade               INTEGER NOT NULL,
  subject             TEXT    NOT NULL,
  topic_slug          TEXT    NOT NULL,
  games_completed     INTEGER NOT NULL DEFAULT 0,
  total_stars         INTEGER NOT NULL DEFAULT 0,
  max_stars           INTEGER NOT NULL DEFAULT 0,
  xp_earned           INTEGER NOT NULL DEFAULT 0,
  certificate_earned  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, grade, subject, topic_slug)
);

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tp_select_own" ON public.topic_progress FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "tp_insert_own" ON public.topic_progress FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tp_update_own" ON public.topic_progress FOR UPDATE  USING (auth.uid() = user_id);

-- ── auto-create profile on sign-up ──────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
