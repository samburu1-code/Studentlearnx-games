'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameResult, StudentProgress } from '@/types/progress';
import { getLevelFromXp } from '@/lib/scoring';

interface ProgressStore extends StudentProgress {
  saveGameResult: (result: GameResult) => void;
  getTopicProgress: (subject: string, grade: number, topicSlug: string) => {
    gamesCompleted: number;
    totalStars: number;
    xpEarned: number;
  };
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

        // Sync to Supabase — fire-and-forget, silently ignored if guest or offline
        fetch('/api/game-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        }).catch(() => {});
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
    }),
    { name: 'slx-progress' }
  )
);
