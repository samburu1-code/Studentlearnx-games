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

export default function AnswerButton({ label, index, state, onClick, disabled }: AnswerButtonProps) {
  const isWrong = state === 'wrong';
  const isCorrect = state === 'correct';
  const isSelected = state === 'selected';
  const isDisabled = state === 'disabled';

  let containerClass = '';
  let badgeClass = '';
  let labelClass = '';

  if (isCorrect) {
    containerClass = 'bg-white border-emerald-600';
    badgeClass = 'bg-emerald-600 text-white border-emerald-600';
    labelClass = 'text-gray-900';
  } else if (isWrong) {
    containerClass = 'bg-white border-red-500';
    badgeClass = 'bg-red-500 text-white border-red-500';
    labelClass = 'text-gray-900';
  } else if (isSelected) {
    containerClass = 'bg-white border-gray-900';
    badgeClass = 'bg-gray-900 text-white border-gray-900';
    labelClass = 'text-gray-900';
  } else if (isDisabled) {
    containerClass = 'bg-white border-gray-200 opacity-60';
    badgeClass = 'bg-gray-100 text-gray-400 border-gray-200';
    labelClass = 'text-gray-400';
  } else {
    containerClass = 'bg-white border-gray-200 hover:border-gray-900';
    badgeClass = 'bg-white text-gray-700 border-gray-300';
    labelClass = 'text-gray-900';
  }

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      animate={isWrong ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={isWrong ? { duration: 0.4 } : { type: 'spring', stiffness: 300 }}
      whileTap={state === 'default' ? { scale: 0.99 } : {}}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-colors duration-150 ${containerClass} ${
        isDisabled ? 'cursor-not-allowed' : isCorrect || isWrong ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <span
        className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center text-base font-bold ${badgeClass}`}
      >
        {OPTION_LABELS[index]}
      </span>
      <span className={`font-medium text-[15px] leading-snug flex-1 ${labelClass}`}>
        {label}
      </span>
      <AnimatePresence>
        {isCorrect && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex-shrink-0 text-emerald-600"
            aria-label="Correct"
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10.5L8 14.5L16 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        )}
        {isWrong && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex-shrink-0 text-red-500"
            aria-label="Wrong"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
