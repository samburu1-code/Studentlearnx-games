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
    <div className="w-full mb-5">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{current}</span>
          <span className="text-gray-400"> of {total}</span>
        </div>

        <AnimatePresence mode="wait">
          {streak >= 2 ? (
            <motion.div
              key="streak"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 text-xs"
            >
              <span className="font-semibold text-gray-900">
                {streak} in a row
              </span>
              {multiplier > 1 && (
                <span
                  className="px-2 py-0.5 rounded text-white font-bold text-[11px]"
                  style={{ backgroundColor: color }}
                >
                  {multiplier}× XP
                </span>
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

      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
