export interface ScoreInput {
  correctCount: number;
  totalQuestions: number;
  totalAttempts: number;
  bestStreak: number;
}

export interface ScoreResult {
  score: number;
  stars: number;
  medal: 'gold' | 'silver' | 'bronze' | 'none';
  xp: number;
  percentage: number;
}

export function calculateScore(input: ScoreInput): ScoreResult {
  const { correctCount, totalQuestions, totalAttempts, bestStreak } = input;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  const baseXp = correctCount * 10;
  const firstAttemptBonus = Math.max(0, (totalQuestions - (totalAttempts - correctCount)) * 5);
  const streakBonus = bestStreak >= 5 ? 15 : bestStreak >= 3 ? 8 : 0;
  const xp = baseXp + firstAttemptBonus + streakBonus;

  let stars = 0;
  if (percentage >= 90) stars = 3;
  else if (percentage >= 70) stars = 2;
  else if (percentage >= 50) stars = 1;

  let medal: 'gold' | 'silver' | 'bronze' | 'none' = 'none';
  if (percentage === 100 && totalAttempts === totalQuestions) medal = 'gold';
  else if (percentage >= 80) medal = 'gold';
  else if (percentage >= 70) medal = 'silver';
  else if (percentage >= 50) medal = 'bronze';

  return { score: correctCount, stars, medal, xp, percentage };
}

export function getXpForLevel(level: number): number {
  return level * 100;
}

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export const CORRECT_MESSAGES = [
  'Excellent! Keep it up! 🌟',
  'Perfect! You nailed it! 🎯',
  'Outstanding! 🚀',
  'Brilliant work! ✨',
  'You got it! Amazing! 🏆',
  'Fantastic! Well done! 🎉',
  'Spot on! Great thinking! 💡',
];

export const RETRY_MESSAGES = [
  "Not quite — try again! 💪",
  "Almost there! Give it another go! 🔄",
  "Keep trying, you've got this! 🌱",
  "Don't give up! Try once more! ⚡",
  "Close! Think it through again! 🤔",
];

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
