'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
  gold: { emoji: '🥇', label: 'Gold Medal', color: '#F59E0B' },
  silver: { emoji: '🥈', label: 'Silver Medal', color: '#9CA3AF' },
  bronze: { emoji: '🥉', label: 'Bronze Medal', color: '#B45309' },
  none: { emoji: '📚', label: 'Keep Practising', color: '#6B7280' },
};

export default function ScoreScreen({
  result, totalQuestions, bestStreak, topicName,
  grade, subject, topicSlug, gameNumber, totalGames, onRetry,
}: ScoreScreenProps) {
  const { playComplete } = useSound();
  const medal = MEDAL_CONFIG[result.medal];
  const nextGameNumber = gameNumber + 1;
  const hasNextGame = nextGameNumber <= totalGames;

  useEffect(() => {
    playComplete();
  }, [playComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] to-[#F0F4FF] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-2"
        >
          {medal.emoji}
        </motion.div>

        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Game Complete!</h2>
        <p className="text-gray-500 text-sm mb-6">{topicName} — Game {gameNumber}</p>

        <div className="bg-gray-50 rounded-2xl p-5 mb-6">
          <p className="text-5xl font-extrabold text-[#1565C0] mb-1">
            {result.score}<span className="text-2xl text-gray-400">/{totalQuestions}</span>
          </p>
          <p className="text-gray-500 text-sm">{result.percentage}% correct</p>

          <div className="flex justify-center gap-1 mt-4 mb-3">
            {[1, 2, 3].map((s) => (
              <motion.span
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: s <= result.stars ? 1 : 0.8 }}
                transition={{ delay: 0.3 + s * 0.15, type: 'spring', stiffness: 300 }}
                className={`text-3xl ${s <= result.stars ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </motion.span>
            ))}
          </div>

          <p className="text-sm font-semibold" style={{ color: medal.color }}>{medal.label}</p>
        </div>

        <div className="flex justify-around text-center mb-6">
          <div>
            <motion.p
              className="text-2xl font-extrabold text-[#1565C0]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              +{result.xp}
            </motion.p>
            <p className="text-xs text-gray-400 mt-0.5">XP Earned ⚡</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-2xl font-extrabold text-orange-500">🔥 {bestStreak}</p>
            <p className="text-xs text-gray-400 mt-0.5">Best Streak</p>
          </div>
        </div>

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
            className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            ← Back to {topicName}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
