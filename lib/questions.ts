import type { Question } from '@/types/question';

export function getQuestionsForGame(questions: Question[], gameNumber: number): Question[] {
  const start = (gameNumber - 1) * 10;
  return questions.slice(start, start + 10);
}

export function getTotalGames(questions: Question[]): number {
  return Math.ceil(questions.length / 10);
}

export function getTopicSlugFromFilename(filename: string): string {
  return filename.replace('.json', '').split('/').pop() || '';
}

/** Convert URL slug ('physics') → DB subject name ('Physics') */
export function subjectSlugToName(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** Map a Supabase DB row to the app's Question type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbRowToQuestion(row: Record<string, any>): Question {
  const options = [
    row.option_a as string,
    row.option_b as string,
    row.option_c as string,
    row.option_d as string,
  ];
  // DB stores correct_answer as 'A'/'B'/'C'/'D' — convert to the actual answer text
  const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  const correctIdx = letterToIndex[row.correct_answer as string];
  const correctAnswer = correctIdx !== undefined ? options[correctIdx] : (row.correct_answer as string);

  return {
    id: row.id as string,
    grade: row.grade as number,
    subject: row.subject as string,
    topic: row.topic as string,
    topicSlug: row.topic_slug as string,
    topicNumber: (row.topic_number as number) ?? 0,
    questionNumber: row.question_number as number,
    gameNumber: row.game_number as number,
    questionText: row.question_text as string,
    options,
    correctAnswer,
    explanation: row.explanation as string | undefined,
    difficulty: (row.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium',
    hasImage: (row.has_image as boolean) ?? false,
    imageUrl: row.image_url as string | undefined,
  };
}

export const SUBJECT_META: Record<string, { color: string; icon: string; label: string }> = {
  physics: { color: '#1565C0', icon: '⚛️', label: 'Physics' },
  chemistry: { color: '#7B1FA2', icon: '🧪', label: 'Chemistry' },
  biology: { color: '#2E7D32', icon: '🧬', label: 'Biology' },
  english: { color: '#E65100', icon: '📚', label: 'English' },
  math: { color: '#AD1457', icon: '📐', label: 'Math' },
};

export const GRADE_LEVELS: Record<number, string> = {
  1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4',
  5: 'Grade 5', 6: 'Grade 6', 7: 'Grade 7', 8: 'Grade 8',
  9: 'Grade 9', 10: 'Grade 10', 11: 'Grade 11', 12: 'Grade 12',
};
