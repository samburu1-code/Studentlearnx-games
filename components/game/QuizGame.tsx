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

/** Fires a subtle celebratory burst on correct answers. */
function fireConfetti(accentColor: string, intensity: number = 1) {
  const count = 60 * intensity;
  confetti({
    origin: { y: 0.6 },
    ticks: 80,
    particleCount: count,
    spread: 55,
    startVelocity: 30,
    colors: [accentColor, '#111827', '#F3F4F6'],
  });
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
      // Celebrate — slightly bigger burst on hot streaks
      const intensity = session.streak >= 4 ? 1.5 : 1;
      fireConfetti(subjectMeta.color, intensity);
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Question {session.currentIndex + 1}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  {q.difficulty}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
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
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="w-full py-4 rounded-xl font-semibold text-white text-base transition-colors hover:opacity-90"
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
