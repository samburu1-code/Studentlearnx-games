'use client';
import QuizGame from '@/components/game/QuizGame';
import type { Question } from '@/types/question';

interface Props {
  questions: Question[];
  allQuestions: Question[];
  gameNumber: number;
  totalGames: number;
}

export default function GameClient({ questions, allQuestions, gameNumber, totalGames }: Props) {
  return (
    <QuizGame
      questions={questions}
      gameNumber={gameNumber}
      totalGames={totalGames}
      allQuestions={allQuestions}
    />
  );
}
