'use client';
import { motion } from 'framer-motion';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  message: string;
  xpGained?: number;
  streak?: number;
  explanation?: string;
  onNext: () => void;
  onRetry: () => void;
}

export default function FeedbackOverlay({
  isCorrect,
  message,
  xpGained,
  streak,
  explanation,
  onNext,
  onRetry,
}: FeedbackOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`mt-4 rounded-2xl border-2 overflow-hidden ${
        isCorrect ? 'bg-[#E8F5E9] border-[#2E7D32]' : 'bg-[#FFF8E1] border-[#F59E0B]'
      }`}
    >
      {/* Feedback header */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{isCorrect ? '🌟' : '💪'}</span>
          <div className="flex-1">
            <p className={`font-bold text-base ${isCorrect ? 'text-[#2E7D32]' : 'text-[#E65100]'}`}>
              {message}
            </p>
            {isCorrect && streak != null && streak >= 3 && (
              <p className="text-sm text-orange-600 mt-1 font-semibold">
                🔥 {streak} in a row!
              </p>
            )}
            {isCorrect && xpGained != null && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-[#1565C0] font-semibold mt-1"
              >
                +{xpGained} XP earned ⚡
              </motion.p>
            )}
            {!isCorrect && (
              <p className="text-xs text-gray-500 mt-2">
                The correct answer is highlighted in green above.
              </p>
            )}
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className={`mt-4 pt-4 border-t ${
              isCorrect ? 'border-[#A5D6A7]' : 'border-[#FFD54F]'
            }`}
          >
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Explanation
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
          </motion.div>
        )}
      </div>

      {/* Action button */}
      <div className="px-5 pb-5">
        {isCorrect ? (
          <button
            onClick={onNext}
            className="w-full bg-[#1565C0] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#0D47A1] transition-colors text-sm"
          >
            Next Question →
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="w-full bg-[#F59E0B] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#D97706] transition-colors text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  );
}
