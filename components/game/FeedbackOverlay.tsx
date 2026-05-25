'use client';
import { motion } from 'framer-motion';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  message: string;
  xpGained?: number;
  streak?: number;
  onNext: () => void;
  onRetry: () => void;
}

export default function FeedbackOverlay({ isCorrect, message, xpGained, streak, onNext, onRetry }: FeedbackOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`mt-4 rounded-2xl p-5 border-2 ${
        isCorrect
          ? 'bg-[#E8F5E9] border-[#2E7D32]'
          : 'bg-[#FFF8E1] border-[#F59E0B]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{isCorrect ? '🌟' : '💪'}</span>
        <div className="flex-1">
          <p className={`font-bold text-base ${isCorrect ? 'text-[#2E7D32]' : 'text-[#E65100]'}`}>
            {message}
          </p>
          {isCorrect && streak && streak >= 3 && (
            <p className="text-sm text-orange-600 mt-1 font-semibold">🔥 {streak} in a row!</p>
          )}
          {isCorrect && xpGained && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-[#1565C0] font-semibold mt-1"
            >
              +{xpGained} XP earned ⚡
            </motion.p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        {isCorrect ? (
          <button
            onClick={onNext}
            className="flex-1 bg-[#1565C0] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#0D47A1] transition-colors text-sm"
          >
            Next Question →
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="flex-1 bg-[#F59E0B] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#D97706] transition-colors text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  );
}
