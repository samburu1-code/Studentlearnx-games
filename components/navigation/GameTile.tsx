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

export default function GameTile({ gameNumber, questionRange, stars, completed, href, subjectColor }: GameTileProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link href={href}>
        <div className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all ${
          completed
            ? 'bg-white border-gray-200 shadow-sm hover:shadow-md'
            : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300'
        }`}>
          {completed && (
            <div
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: subjectColor }}
            >
              ✓
            </div>
          )}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Game {gameNumber}</p>
          <p className="text-sm font-medium text-gray-700 mb-3">{questionRange}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-base ${s <= stars ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: subjectColor }}
            >
              {completed ? 'Play Again' : 'Start →'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
