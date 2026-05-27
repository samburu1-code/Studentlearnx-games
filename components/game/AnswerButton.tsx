'use client';
import { motion, AnimatePresence } from 'framer-motion';

type ButtonState = 'default' | 'selected' | 'correct' | 'wrong' | 'disabled';

interface AnswerButtonProps {
  label: string;
  index: number;
  state: ButtonState;
  onClick: () => void;
  disabled?: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// Per-option gradient palettes for bolder, more game-like cards
const DEFAULT_GRADIENTS = [
  'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200',
  'from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200',
  'from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200',
  'from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-emerald-200',
];

const BADGE_GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
  'bg-gradient-to-br from-purple-500 to-pink-600 text-white',
  'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
];

export default function AnswerButton({ label, index, state, onClick, disabled }: AnswerButtonProps) {
  const isWrong = state === 'wrong';
  const isCorrect = state === 'correct';
  const isSelected = state === 'selected';
  const isDisabled = state === 'disabled';

  // Build classes based on state
  let containerClass = '';
  let badgeClass = '';

  if (isCorrect) {
    containerClass = 'bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-500 ring-4 ring-emerald-200';
    badgeClass = 'bg-gradient-to-br from-emerald-500 to-green-600 text-white';
  } else if (isWrong) {
    containerClass = 'bg-gradient-to-br from-red-100 to-rose-100 border-red-500';
    badgeClass = 'bg-gradient-to-br from-red-500 to-rose-600 text-white';
  } else if (isSelected) {
    containerClass = 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-500 ring-4 ring-blue-200 shadow-lg';
    badgeClass = 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white';
  } else if (isDisabled) {
    containerClass = 'bg-gray-50 border-gray-200 opacity-50';
    badgeClass = 'bg-gray-200 text-gray-400';
  } else {
    containerClass = `bg-gradient-to-br ${DEFAULT_GRADIENTS[index % 4]} hover:shadow-lg hover:-translate-y-0.5`;
    badgeClass = BADGE_GRADIENTS[index % 4];
  }

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      animate={isWrong ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={isWrong ? { duration: 0.45 } : { type: 'spring', stiffness: 300 }}
      whileHover={state === 'default' ? { scale: 1.02 } : {}}
      whileTap={state === 'default' ? { scale: 0.97 } : {}}
      className={`w-full flex items-center gap-4 px-5 py-5 sm:py-6 rounded-3xl border-2 text-left transition-all duration-200 ${containerClass} ${
        isDisabled ? 'cursor-not-allowed' : isCorrect || isWrong ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <span
        className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-md transition-all ${badgeClass}`}
      >
        {OPTION_LABELS[index]}
      </span>
      <span className={`font-bold text-base sm:text-lg leading-snug flex-1 ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
        {label}
      </span>
      <AnimatePresence>
        {isCorrect && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center"
            aria-label="Correct"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10.5L8 14.5L16 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        )}
        {isWrong && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center"
            aria-label="Wrong"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
