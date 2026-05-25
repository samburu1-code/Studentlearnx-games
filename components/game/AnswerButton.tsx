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

const stateStyles: Record<ButtonState, string> = {
  default: 'bg-white border-gray-200 text-gray-800 hover:border-[#1565C0] hover:bg-blue-50 hover:shadow-md cursor-pointer',
  selected: 'bg-[#E3F2FD] border-[#1565C0] text-[#1565C0] shadow-md cursor-pointer',
  correct: 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32] shadow-md cursor-default',
  wrong: 'bg-[#FFEBEE] border-[#C62828] text-[#C62828] cursor-default',
  disabled: 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed',
};

const labelStyles: Record<ButtonState, string> = {
  default: 'bg-gray-100 text-gray-500',
  selected: 'bg-[#1565C0] text-white',
  correct: 'bg-[#2E7D32] text-white',
  wrong: 'bg-[#C62828] text-white',
  disabled: 'bg-gray-200 text-gray-300',
};

export default function AnswerButton({ label, index, state, onClick, disabled }: AnswerButtonProps) {
  const isWrong = state === 'wrong';

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      animate={isWrong ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={isWrong ? { duration: 0.4 } : { type: 'spring', stiffness: 300 }}
      whileHover={state === 'default' ? { scale: 1.01 } : {}}
      whileTap={state === 'default' ? { scale: 0.98 } : {}}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${stateStyles[state]}`}
    >
      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${labelStyles[state]}`}>
        {OPTION_LABELS[index]}
      </span>
      <span className="font-medium text-[15px] leading-snug flex-1">{label}</span>
      {state === 'correct' && (
        <AnimatePresence>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[#2E7D32] text-xl"
          >
            ✓
          </motion.span>
        </AnimatePresence>
      )}
      {state === 'wrong' && <span className="text-[#C62828] text-xl">✗</span>}
    </motion.button>
  );
}
