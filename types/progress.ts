export interface GameResult {
  grade: number;
  subject: string;
  topic: string;
  topicSlug: string;
  gameNumber: number;
  score: number;
  totalQuestions: number;
  attempts: number;
  stars: number;
  medal: 'gold' | 'silver' | 'bronze' | 'none';
  xpEarned: number;
  bestStreak: number;
  completedAt: string;
}

export interface TopicProgress {
  topicSlug: string;
  subject: string;
  grade: number;
  gamesCompleted: number;
  totalGames: number;
  totalStars: number;
  maxStars: number;
  xpEarned: number;
  certificateEarned: boolean;
}

export interface StudentProgress {
  totalXp: number;
  level: number;
  gameResults: GameResult[];
  topicProgress: Record<string, TopicProgress>;
}
