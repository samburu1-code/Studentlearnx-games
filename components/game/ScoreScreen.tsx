'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import type { ScoreResult } from '@/lib/scoring';
import { useSound } from '@/hooks/useSound';

interface ScoreScreenProps {
  result: ScoreResult;
  totalQuestions: number;
  bestStreak: number;
  topicName: string;
  grade: number;
  subject: string;
  topicSlug: string;
  gameNumber: number;
  totalGames: number;
  onRetry: () => void;
}

const MEDAL_CONFIG = {
  gold:   { emoji: '🥇', label: 'Gold Medal',       color: '#F59E0B' },
  silver: { emoji: '🥈', label: 'Silver Medal',     color: '#9CA3AF' },
  bronze: { emoji: '🥉', label: 'Bronze Medal',     color: '#B45309' },
  none:   { emoji: '📚', label: 'Keep Practising',  color: '#6B7280' },
};

/** Simple integer count-up hook */
function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 20;
    const increment = target / steps;
    const interval = durationMs / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setValue(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [target, durationMs]);
  return value;
}

export default function ScoreScreen({
  result,
  totalQuestions,
  bestStreak,
  topicName,
  grade,
  subject,
  topicSlug,
  gameNumber,
  totalGames,
  onRetry,
}: ScoreScreenProps) {
  const { playComplete } = useSound();
  const medal = MEDAL_CONFIG[result.medal];
  const nextGameNumber = gameNumber + 1;
  const hasNextGame = nextGameNumber <= totalGames;

  const displayScore = useCountUp(result.score, 700);
  const displayXp    = useCountUp(result.xp,    900);

  useEffect(() => {
    playComplete();
    // Celebrate good scores with confetti
    if (result.percentage >= 70) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: result.percentage === 100 ? 160 : 100,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#1565C0', '#F59E0B', '#10B981', '#111827', '#ffffff'],
          startVelocity: result.percentage === 100 ? 40 : 30,
        });
      }, 350);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] to-[#F0F4FF] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        {/* Medal */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-2"
        >
          {medal.emoji}
        </motion.div>

        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Game Complete!</h2>
        <p className="text-gray-400 text-sm mb-6">
          {topicName} — Game {gameNumber}
        </p>

        {/* Score block */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-5">
          <p className="text-5xl font-extrabold text-[#1565C0] mb-1 tabular-nums">
            {displayScore}
            <span className="text-2xl text-gray-400">/{totalQuestions}</span>
          </p>
          <p className="text-gray-400 text-sm mb-4">{result.percentage}% correct</p>

          {/* Performance dots */}
          <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.04, type: 'spring', stiffness: 350 }}
                className={`w-5 h-2.5 rounded-full ${
                  i < result.score ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3].map((s) => (
              <motion.span
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: s <= result.stars ? 1 : 0.75 }}
                transition={{ delay: 0.45 + s * 0.12, type: 'spring', stiffness: 300 }}
                className={`text-3xl ${s <= result.stars ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </motion.span>
            ))}
          </div>

          <p className="text-sm font-semibold" style={{ color: medal.color }}>
            {medal.label}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-around text-center mb-6">
          <div>
            <motion.p
              className="text-2xl font-extrabold text-[#1565C0] tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              +{displayXp}
            </motion.p>
            <p className="text-xs text-gray-400 mt-0.5">XP Earned ⚡</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-2xl font-extrabold text-orange-500">🔥 {bestStreak}</p>
            <p className="text-xs text-gray-400 mt-0.5">Best Streak</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {hasNextGame && (
            <Link
              href={`/games/${grade}/${subject.toLowerCase()}/${topicSlug}/${nextGameNumber}`}
              className="w-full bg-[#1565C0] text-white font-bold py-3.5 rounded-xl hover:bg-[#0D47A1] transition-colors text-sm"
            >
              Next Game → (Game {nextGameNumber})
            </Link>
          )}
          <button
            onClick={onRetry}
            className="w-full border-2 border-[#1565C0] text-[#1565C0] font-bold py-3 rounded-xl hover:bg-[#E3F2FD] transition-colors text-sm"
          >
            ↻ Retry This Game
          </button>
          <Link
            href={`/games/${grade}/${subject.toLowerCase()}/${topicSlug}`}
            className="w-full border border-gray-200 text-gray-500 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            ← Back to {topicName}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
