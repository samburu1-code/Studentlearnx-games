'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameSession } from '@/hooks/useGameSession';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { useSound } from '@/hooks/useSound';
import { calculateScore, getRandomMessage, CORRECT_MESSAGES, RETRY_MESSAGES } from '@/lib/scoring';
import { SUBJECT_META, getTotalGames } from '@/lib/questions';
import type { Question } from '@/types/question';
import ProgressBar from './ProgressBar';
import AnswerButton from './AnswerButton';
import FeedbackOverlay from './FeedbackOverlay';
import ScoreScreen from './ScoreScreen';
import type { GameResult } from '@/types/progress';

interface QuizGameProps {
  questions: Question[];
  gameNumber: number;
  totalGames: number;
  allQuestions: Question[];
}

type ButtonState = 'default' | 'selected' | 'correct' | 'wrong' | 'disabled';

export default function QuizGame({ questions, gameNumber, totalGames, allQuestions }: QuizGameProps) {
  const session = useGameSession();
  const { saveGameResult } = useStudentProgress();
  const { playCorrect, playIncorrect } = useSound();
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    session.initGame(questions);
    setResultSaved(false);
  }, [questions]);

  const q = session.questions[session.currentIndex];
  if (!q) return null;

  const subjectSlug = q.subject.toLowerCase();
  const subjectMeta = SUBJECT_META[subjectSlug] || SUBJECT_META['physics'];

  const handleSelect = (option: string) => {
    if (session.phase !== 'question') return;
    session.selectOption(option);
  };

  const handleSubmit = () => {
    if (!session.selectedOption || session.phase !== 'question') return;
    const correct = session.selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (correct) {
      playCorrect();
      setFeedbackMsg(getRandomMessage(CORRECT_MESSAGES));
    } else {
      playIncorrect();
      setFeedbackMsg(getRandomMessage(RETRY_MESSAGES));
    }
    session.submitAnswer();
  };

  const handleNext = () => {
    session.nextQuestion();
  };

  const handleRetryQuestion = () => {
    session.nextQuestion();
  };

  const getButtonState = (option: string): ButtonState => {
    if (session.phase === 'question') {
      if (session.selectedOption === option) return 'selected';
      return 'default';
    }
    if (session.phase === 'feedback') {
      const isCorrect = session.lastAnswerCorrect;
      if (option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        return isCorrect ? 'correct' : 'disabled';
      }
      if (option === session.selectedOption && !isCorrect) return 'wrong';
      return 'disabled';
    }
    return 'disabled';
  };

  if (session.phase === 'complete') {
    const correctCount = session.answers.filter(Boolean).length;
    const result = calculateScore({
      correctCount,
      totalQuestions: questions.length,
      totalAttempts: session.totalAttempts,
      bestStreak: session.bestStreak,
    });

    if (!resultSaved) {
      setResultSaved(true);
      const gameResult: GameResult = {
        grade: q.grade,
        subject: q.subject,
        topic: q.topic,
        topicSlug: q.topicSlug,
        gameNumber,
        score: result.score,
        totalQuestions: questions.length,
        attempts: session.totalAttempts,
        stars: result.stars,
        medal: result.medal,
        xpEarned: result.xp,
        bestStreak: session.bestStreak,
        completedAt: new Date().toISOString(),
      };
      saveGameResult(gameResult);
    }

    return (
      <ScoreScreen
        result={result}
        totalQuestions={questions.length}
        bestStreak={session.bestStreak}
        topicName={q.topic}
        grade={q.grade}
        subject={q.subject}
        topicSlug={q.topicSlug}
        gameNumber={gameNumber}
        totalGames={totalGames}
        onRetry={() => { session.resetGame(); setResultSaved(false); }}
      />
    );
  }

  const correctInRow = session.answers.filter(Boolean).length;
  const xpForQuestion = 10 + (session.lastAnswerCorrect && session.attempts[session.currentIndex] === 1 ? 5 : 0);

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href={`/games/${q.grade}/${subjectSlug}/${q.topicSlug}`} className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium">
            ← Exit
          </Link>
          <div className="flex-1">
            <ProgressBar current={correctInRow} total={questions.length} color={subjectMeta.color} />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-500">
            {session.streak >= 3 && <span>🔥 {session.streak}</span>}
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2 flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">{q.topic}</span>
          <span className="text-gray-200">•</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: subjectMeta.color }}
          >
            {q.subject}
          </span>
          <span className="text-gray-200">•</span>
          <span className="text-xs text-gray-400">Grade {q.grade}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Question {session.currentIndex + 1} / {questions.length}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {q.difficulty}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-relaxed">{q.questionText}</h2>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {q.options.map((option, i) => (
                <AnswerButton
                  key={i}
                  label={option}
                  index={i}
                  state={getButtonState(option)}
                  onClick={() => handleSelect(option)}
                  disabled={session.phase !== 'question'}
                />
              ))}
            </div>

            {session.phase === 'question' && session.selectedOption && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg transition-all"
                style={{ backgroundColor: subjectMeta.color }}
              >
                Check Answer
              </motion.button>
            )}

            {session.phase === 'feedback' && (
              <FeedbackOverlay
                isCorrect={!!session.lastAnswerCorrect}
                message={feedbackMsg}
                xpGained={session.lastAnswerCorrect ? xpForQuestion : undefined}
                streak={session.streak}
                onNext={handleNext}
                onRetry={handleRetryQuestion}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
