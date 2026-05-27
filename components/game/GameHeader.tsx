'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { getStreakMultiplier } from '@/hooks/useGameSession';

interface GameHeaderProps {
  current: number;
  total: number;
  streak: number;
  color?: string;
}

export default function GameHeader({
  current,
  total,
  streak,
  color = '#1565C0',
}: GameHeaderProps) {
  const pct = Math.round((current / total) * 100);
  const multiplier = getStreakMultiplier(streak);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        {/* Question counter */}
        <div className="text-sm font-extrabold text-gray-700">
          Question <span className="text-gray-900">{current}</span>
          <span className="text-gray-400"> / {total}</span>
        </div>

        {/* Streak with multiplier */}
        <AnimatePresence mode="wait">
          {streak >= 2 ? (
            <motion.div
              key="streak"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-extrabold text-sm shadow-md"
            >
              <span className="text-lg">🔥</span>
              <span>{streak}</span>
              {multiplier > 1 && (
                <motion.span
                  key={multiplier}
                  initial={{ scale: 0.5, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="ml-1 text-yellow-100 text-xs bg-black/25 px-2 py-0.5 rounded-full"
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
              className="text-xs text-gray-400 font-medium"
            >
              Get a streak for bonus XP →
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, #7C3AED 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
