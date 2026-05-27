'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameResult, StudentProgress, TopicProgress } from '@/types/progress';
import { getLevelFromXp } from '@/lib/scoring';
import { getEmbeddedStudent } from '@/hooks/useEmbeddedStudent';

interface ProgressStore extends StudentProgress {
  saveGameResult: (result: GameResult) => void;
  getTopicProgress: (subject: string, grade: number, topicSlug: string) => {
    gamesCompleted: number;
    totalStars: number;
    xpEarned: number;
  };
  loadFromServer: () => Promise<void>;
  resetProgress: () => void;
}

export const useStudentProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      level: 1,
      gameResults: [],
      topicProgress: {},

      saveGameResult: (result) => {
        const { gameResults, totalXp, topicProgress } = get();
        const key = `${result.grade}-${result.subject}-${result.topicSlug}`;
        const existing = topicProgress[key];
        const newTotalXp = totalXp + result.xpEarned;
        const newTopicEntry = {
          topicSlug: result.topicSlug,
          subject: result.subject,
          grade: result.grade,
          gamesCompleted: (existing?.gamesCompleted || 0) + 1,
          totalGames: 0,
          totalStars: (existing?.totalStars || 0) + result.stars,
          maxStars: (existing?.maxStars || 0) + 3,
          xpEarned: (existing?.xpEarned || 0) + result.xpEarned,
          certificateEarned: false,
        };
        set({
          gameResults: [...gameResults, result],
          totalXp: newTotalXp,
          level: getLevelFromXp(newTotalXp),
          topicProgress: { ...topicProgress, [key]: newTopicEntry },
        });

        // Sync to Supabase — fire-and-forget. Two cases:
        //   1. Embedded mode (iframe with student_email) → /api/embed/save
        //   2. Auth user (logged in via Supabase) → /api/game-sessions
        // If neither applies (anonymous guest), the calls fail silently and
        // progress stays in localStorage only.
        const embedded = getEmbeddedStudent();
        if (embedded) {
          fetch('/api/embed/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...result,
              student_email: embedded.email,
              student_name: embedded.name,
            }),
          }).catch(() => {});
        } else {
          fetch('/api/game-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
          }).catch(() => {});
        }
      },

      getTopicProgress: (subject, grade, topicSlug) => {
        const key = `${grade}-${subject}-${topicSlug}`;
        const tp = get().topicProgress[key];
        return {
          gamesCompleted: tp?.gamesCompleted || 0,
          totalStars: tp?.totalStars || 0,
          xpEarned: tp?.xpEarned || 0,
        };
      },

      /**
       * Pull saved progress from Supabase. Uses /api/embed/progress in embed
       * mode (when iframe URL provided student_email), otherwise falls back
       * to the auth-based /api/progress.
       */
      loadFromServer: async () => {
        try {
          const embedded = getEmbeddedStudent();
          const endpoint = embedded
            ? `/api/embed/progress?email=${encodeURIComponent(embedded.email)}`
            : '/api/progress';

          const res = await fetch(endpoint);
          if (!res.ok) return; // 401/400 — ignore silently
          const data = await res.json();

          // Map server game_sessions rows → GameResult format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const gameResults: GameResult[] = (data.gameResults ?? []).map((s: any) => ({
            grade: s.grade,
            subject: s.subject,
            topic: s.topic,
            topicSlug: s.topic_slug,
            gameNumber: s.game_number,
            score: s.score,
            totalQuestions: s.total_questions,
            attempts: s.total_questions,
            stars: s.stars,
            medal: s.medal,
            xpEarned: s.xp_earned,
            bestStreak: s.best_streak ?? 0,
            completedAt: s.completed_at,
          }));

          // Map server topic_progress rows → keyed object
          const topicProgress: Record<string, TopicProgress> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const t of (data.topicProgress ?? []) as any[]) {
            const key = `${t.grade}-${t.subject}-${t.topic_slug}`;
            topicProgress[key] = {
              topicSlug: t.topic_slug,
              subject: t.subject,
              grade: t.grade,
              gamesCompleted: t.games_completed ?? 0,
              totalGames: 0,
              totalStars: t.total_stars ?? 0,
              maxStars: t.max_stars ?? 0,
              xpEarned: t.xp_earned ?? 0,
              certificateEarned: false,
            };
          }

          // Both endpoints surface XP/level slightly differently
          const profile = data.profile ?? data.student ?? {};
          set({
            gameResults,
            topicProgress,
            totalXp: profile.total_xp ?? 0,
            level: profile.level ?? 1,
          });
        } catch {
          // Network error — keep local state
        }
      },

      /** Clear all local progress (used on sign-out). */
      resetProgress: () => {
        set({
          totalXp: 0,
          level: 1,
          gameResults: [],
          topicProgress: {},
        });
      },
    }),
    { name: 'slx-progress' }
  )
);
