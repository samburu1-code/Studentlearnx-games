import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import type { Question } from '@/types/question';
import { getQuestionsForGame, getTotalGames } from '@/lib/questions';
import GameClient from './GameClient';

function loadQuestions(grade: string, subject: string, topic: string): Question[] | null {
  const candidates = [
    path.join(process.cwd(), 'data', `grade-${grade}`, subject, `topic-${topic}.json`),
    path.join(process.cwd(), 'data', `grade-${grade}`, subject, `topic-1-${topic}.json`),
  ];
  for (const p of candidates) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8')) as Question[];
    } catch {}
  }
  return null;
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ grade: string; subject: string; topic: string; gameNumber: string }>;
}) {
  const { grade, subject, topic, gameNumber } = await params;
  const allQuestions = loadQuestions(grade, subject, topic);

  if (!allQuestions) notFound();

  const gameNum = parseInt(gameNumber);
  const totalGames = getTotalGames(allQuestions);
  if (isNaN(gameNum) || gameNum < 1 || gameNum > totalGames) notFound();

  const gameQuestions = getQuestionsForGame(allQuestions, gameNum);

  return (
    <GameClient
      questions={gameQuestions}
      allQuestions={allQuestions}
      gameNumber={gameNum}
      totalGames={totalGames}
    />
  );
}
