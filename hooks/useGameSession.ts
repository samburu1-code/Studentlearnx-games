'use client';
import { create } from 'zustand';
import type { Question } from '@/types/question';

interface GameSessionState {
  questions: Question[];
  currentIndex: number;
  answers: (string | null)[];
  attempts: number[];
  streak: number;
  bestStreak: number;
  totalAttempts: number;
  lives: number;
  phase: 'question' | 'feedback' | 'complete' | 'gameover';
  lastAnswerCorrect: boolean | null;
  selectedOption: string | null;

  initGame: (questions: Question[]) => void;
  selectOption: (option: string) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetGame: () => void;
}

export const MAX_LIVES = 3;

/** Streak multiplier — rewards consecutive correct answers */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 5;
  if (streak >= 7) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export const useGameSession = create<GameSessionState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  attempts: [],
  streak: 0,
  bestStreak: 0,
  totalAttempts: 0,
  lives: MAX_LIVES,
  phase: 'question',
  lastAnswerCorrect: null,
  selectedOption: null,

  initGame: (questions) =>
    set({
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      attempts: new Array(questions.length).fill(0),
      streak: 0,
      bestStreak: 0,
      totalAttempts: 0,
      lives: MAX_LIVES,
      phase: 'question',
      lastAnswerCorrect: null,
      selectedOption: null,
    }),

  selectOption: (option) => set({ selectedOption: option }),

  submitAnswer: () => {
    const { questions, currentIndex, selectedOption, answers, attempts, streak, lives } = get();
    if (!selectedOption) return;
    const q = questions[currentIndex];
    const correct = selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    const newAttempts = [...attempts];
    newAttempts[currentIndex] = (newAttempts[currentIndex] || 0) + 1;
    const newAnswers = [...answers];
    if (correct) newAnswers[currentIndex] = selectedOption;
    const newStreak = correct ? streak + 1 : 0;
    const newLives = correct ? lives : Math.max(0, lives - 1);
    set({
      answers: newAnswers,
      attempts: newAttempts,
      totalAttempts: get().totalAttempts + 1,
      streak: newStreak,
      bestStreak: Math.max(get().bestStreak, newStreak),
      lives: newLives,
      phase: 'feedback',
      lastAnswerCorrect: correct,
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions, answers } = get();
    if (answers[currentIndex] === null) {
      set({ phase: 'question', selectedOption: null });
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      set({ phase: 'complete' });
    } else {
      set({ currentIndex: nextIndex, phase: 'question', selectedOption: null });
    }
  },

  resetGame: () => {
    const { questions } = get();
    set({
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      attempts: new Array(questions.length).fill(0),
      streak: 0,
      bestStreak: 0,
      totalAttempts: 0,
      lives: MAX_LIVES,
      phase: 'question',
      lastAnswerCorrect: null,
      selectedOption: null,
    });
  },
}));
