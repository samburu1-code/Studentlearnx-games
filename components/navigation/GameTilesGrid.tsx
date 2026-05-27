'use client';
import { useMemo } from 'react';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import GameTile from './GameTile';

interface GameTilesGridProps {
  grade: number;
  subject: string; // DB form, e.g. "Physics"
  subjectSlug: string; // URL slug, e.g. "physics"
  topic: string; // URL slug
  topicSlug: string; // DB slug
  totalGames: number;
  subjectColor: string;
}

/**
 * Client component that renders the grid of GameTile cards,
 * pulling completion + star data from localStorage student progress.
 */
export default function GameTilesGrid({
  grade,
  subject,
  subjectSlug,
  topic,
  topicSlug,
  totalGames,
  subjectColor,
}: GameTilesGridProps) {
  const gameResults = useStudentProgress((s) => s.gameResults);

  // Build a map of gameNumber → best result for this topic
  const bestByGame = useMemo(() => {
    const m = new Map<number, { stars: number; score: number }>();
    for (const r of gameResults) {
      if (r.grade !== grade) continue;
      if (r.subject !== subject) continue;
      if (r.topicSlug !== topicSlug) continue;
      const existing = m.get(r.gameNumber);
      if (!existing || r.stars > existing.stars) {
        m.set(r.gameNumber, { stars: r.stars, score: r.score });
      }
    }
    return m;
  }, [gameResults, grade, subject, topicSlug]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: totalGames }, (_, i) => {
        const gameNum = i + 1;
        const start = (gameNum - 1) * 10 + 1;
        const end = gameNum * 10;
        const best = bestByGame.get(gameNum);
        return (
          <GameTile
            key={gameNum}
            gameNumber={gameNum}
            questionRange={`Q${start}–Q${end}`}
            stars={best?.stars ?? 0}
            completed={!!best}
            href={`/games/${grade}/${subjectSlug}/${topic}/${gameNum}`}
            subjectColor={subjectColor}
          />
        );
      })}
    </div>
  );
}
