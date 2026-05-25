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
  phase: 'question' | 'feedback' | 'complete';
  lastAnswerCorrect: boolean | null;
  selectedOption: string | null;

  initGame: (questions: Question[]) => void;
  selectOption: (option: string) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetGame: () => void;
}

export const useGameSession = create<GameSessionState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  attempts: [],
  streak: 0,
  bestStreak: 0,
  totalAttempts: 0,
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
      phase: 'question',
      lastAnswerCorrect: null,
      selectedOption: null,
    }),

  selectOption: (option) => set({ selectedOption: option }),

  submitAnswer: () => {
    const { questions, currentIndex, selectedOption, answers, attempts, streak } = get();
    if (!selectedOption) return;
    const q = questions[currentIndex];
    const correct = selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    const newAttempts = [...attempts];
    newAttempts[currentIndex] = (newAttempts[currentIndex] || 0) + 1;
    const newAnswers = [...answers];
    if (correct) newAnswers[currentIndex] = selectedOption;
    const newStreak = correct ? streak + 1 : 0;
    set({
      answers: newAnswers,
      attempts: newAttempts,
      totalAttempts: get().totalAttempts + 1,
      streak: newStreak,
      bestStreak: Math.max(get().bestStreak, newStreak),
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
      phase: 'question',
      lastAnswerCorrect: null,
      selectedOption: null,
    });
  },
}));
