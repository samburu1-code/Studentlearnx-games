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
