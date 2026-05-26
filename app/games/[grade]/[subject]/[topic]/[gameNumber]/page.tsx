import { notFound } from 'next/navigation';
import type { Question } from '@/types/question';
import { subjectSlugToName, mapDbRowToQuestion } from '@/lib/questions';
import { createClient } from '@/lib/supabase/server';
import GameClient from './GameClient';

async function loadGameFromSupabase(
  grade: number,
  subject: string,
  topicSlug: string,
  gameNumber: number
): Promise<{ questions: Question[]; totalGames: number } | null> {
  const supabase = await createClient();
  const subjectName = subjectSlugToName(subject);

  // Load the 10 questions for this specific game
  const { data: gameQuestions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('grade', grade)
    .eq('subject', subjectName)
    .eq('topic_slug', topicSlug)
    .eq('game_number', gameNumber)
    .order('question_number');

  if (error || !gameQuestions || gameQuestions.length === 0) return null;

  // Get the total number of games for this topic
  const { data: maxGameData } = await supabase
    .from('questions')
    .select('game_number')
    .eq('grade', grade)
    .eq('subject', subjectName)
    .eq('topic_slug', topicSlug)
    .order('game_number', { ascending: false })
    .limit(1);

  const totalGames = (maxGameData?.[0]?.game_number as number) ?? 1;

  return {
    questions: gameQuestions.map(mapDbRowToQuestion),
    totalGames,
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{
    grade: string;
    subject: string;
    topic: string;
    gameNumber: string;
  }>;
}) {
  const { grade, subject, topic, gameNumber } = await params;
  const gradeNum = parseInt(grade);
  const gameNum = parseInt(gameNumber);

  if (isNaN(gameNum) || gameNum < 1) notFound();

  const result = await loadGameFromSupabase(gradeNum, subject, topic, gameNum);
  if (!result) notFound();

  const { questions, totalGames } = result;

  return (
    <GameClient
      questions={questions}
      allQuestions={questions}
      gameNumber={gameNum}
      totalGames={totalGames}
    />
  );
}
