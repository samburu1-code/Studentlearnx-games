'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface GameTileProps {
  gameNumber: number;
  questionRange: string;
  stars: number;
  completed: boolean;
  href: string;
  subjectColor: string;
}

export default function GameTile({
  gameNumber,
  questionRange,
  stars,
  completed,
  href,
  subjectColor,
}: GameTileProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link href={href}>
        <div
          className={`relative rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
            completed
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          {completed && (
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Completed"
              >
                <path
                  d="M4 10.5L8 14.5L16 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <p
            className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
              completed ? 'text-emerald-700' : 'text-gray-400'
            }`}
          >
            Game {gameNumber}
          </p>
          <p
            className={`text-sm font-medium mb-3 ${
              completed ? 'text-emerald-900' : 'text-gray-700'
            }`}
          >
            {questionRange}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`text-base ${
                    s <= stars ? 'text-yellow-500' : 'text-gray-200'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                completed ? 'bg-emerald-600 text-white' : 'text-white'
              }`}
              style={completed ? undefined : { backgroundColor: subjectColor }}
            >
              {completed ? 'Play Again' : 'Start'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
