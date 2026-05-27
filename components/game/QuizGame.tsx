'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useGameSession, getStreakMultiplier } from '@/hooks/useGameSession';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { useSound } from '@/hooks/useSound';
import { calculateScore, getRandomMessage, CORRECT_MESSAGES, RETRY_MESSAGES } from '@/lib/scoring';
import { SUBJECT_META } from '@/lib/questions';
import type { Question } from '@/types/question';
import AnswerButton from './AnswerButton';
import FeedbackOverlay from './FeedbackOverlay';
import ScoreScreen from './ScoreScreen';
import GameHeader from './GameHeader';
import type { GameResult } from '@/types/progress';

interface QuizGameProps {
  questions: Question[];
  gameNumber: number;
  totalGames: number;
  allQuestions: Question[];
}

type ButtonState = 'default' | 'selected' | 'correct' | 'wrong' | 'disabled';

/** Fires a celebratory confetti burst on correct answers. */
function fireConfetti(intensity: number = 1) {
  const count = 80 * intensity;
  const defaults = { origin: { y: 0.6 }, ticks: 100 };
  confetti({
    ...defaults,
    particleCount: count,
    spread: 70,
    startVelocity: 35,
    colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  });
  // Second burst from sides for extra flair on big streaks
  if (intensity >= 2) {
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 40, spread: 60, origin: { x: 0.1, y: 0.7 }, angle: 60 });
      confetti({ ...defaults, particleCount: 40, spread: 60, origin: { x: 0.9, y: 0.7 }, angle: 120 });
    }, 150);
  }
}

export default function QuizGame({ questions, gameNumber, totalGames }: QuizGameProps) {
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
      // Celebrate — bigger burst on hot streaks
      const intensity = session.streak >= 4 ? 2 : 1;
      fireConfetti(intensity);
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

  // XP for this question — base + first-try bonus, multiplied by streak bonus
  const multiplier = getStreakMultiplier(session.streak);
  const baseXp = 10 + (session.lastAnswerCorrect && session.attempts[session.currentIndex] === 1 ? 5 : 0);
  const xpForQuestion = Math.round(baseXp * multiplier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4FF] via-white to-[#FDF4FF]">
      <div className="bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href={`/games/${q.grade}/${subjectSlug}/${q.topicSlug}`}
            className="text-gray-400 hover:text-gray-700 transition-colors text-sm font-bold flex items-center gap-1"
          >
            ← Exit
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">{q.topic}</span>
            <span className="text-gray-200">•</span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: subjectMeta.color }}
            >
              {q.subject}
            </span>
            <span className="text-gray-200 hidden sm:inline">•</span>
            <span className="text-xs text-gray-400 hidden sm:inline">Grade {q.grade}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <GameHeader
          current={session.currentIndex + 1}
          total={questions.length}
          lives={session.lives}
          streak={session.streak}
          color={subjectMeta.color}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentIndex}
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 sm:p-7 mb-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Question {session.currentIndex + 1} / {questions.length}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    q.difficulty === 'easy'
                      ? 'bg-green-100 text-green-700'
                      : q.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {q.difficulty.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-relaxed">
                {q.questionText}
              </h2>
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-base shadow-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${subjectMeta.color} 0%, #7C3AED 100%)`,
                }}
              >
                Check Answer →
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
