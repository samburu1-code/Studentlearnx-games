'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { getStreakMultiplier } from '@/hooks/useGameSession';

interface GameHeaderProps {
  current: number;
  total: number;
  streak: number;
  color?: string;
  answers: (string | null)[];
  attempts: number[];
}

export default function GameHeader({
  current,
  total,
  streak,
  color = '#1565C0',
  answers,
  attempts,
}: GameHeaderProps) {
  const multiplier = getStreakMultiplier(streak);

  return (
    <div className="w-full mb-5">
      {/* Question progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap">
        {Array.from({ length: total }, (_, i) => {
          const isCompleted = answers[i] != null;
          const isAttempted = answers[i] == null && (attempts[i] ?? 0) > 0;
          const isCurrent = i === current - 1;

          let bg = '#E5E7EB'; // gray – upcoming
          if (isCompleted) bg = '#10B981'; // emerald – done
          else if (isAttempted) bg = '#F59E0B'; // amber – retrying

          return (
            <motion.div
              key={i}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ backgroundColor: isCurrent ? color : bg }}
              className={`rounded-full transition-colors duration-300 ${
                isCurrent ? 'w-7 h-2.5' : 'w-2.5 h-2.5'
              }`}
            />
          );
        })}
      </div>

      {/* Question counter + streak badge */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{current}</span>
          <span className="text-gray-400"> of {total}</span>
        </div>

        <AnimatePresence mode="wait">
          {streak >= 2 ? (
            <motion.div
              key="streak"
              initial={{ opacity: 0, y: -4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 text-xs"
            >
              <span className="font-semibold text-gray-900">🔥 {streak} in a row</span>
              {multiplier > 1 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="px-2 py-0.5 rounded-full text-white font-bold text-[11px]"
                  style={{ backgroundColor: color }}
                >
                  {multiplier}× XP
                </motion.span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-400"
            >
              Build a streak for bonus XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
