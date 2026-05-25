export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  grade: number;
  subject: string;
  topic: string;
  topicSlug: string;
  topicNumber: number;
  questionNumber: number;
  gameNumber: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: Difficulty;
  hasImage?: boolean;
  imageUrl?: string;
}

export interface TopicMeta {
  slug: string;
  name: string;
  topicNumber: number;
  totalQuestions: number;
  totalGames: number;
  subject: string;
  grade: number;
}

export interface SubjectMeta {
  slug: string;
  name: string;
  grade: number;
  topics: TopicMeta[];
  color: string;
  icon: string;
}
