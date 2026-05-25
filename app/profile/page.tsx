'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { useAuth } from '@/hooks/useAuth';
import { getLevelFromXp, getXpForLevel } from '@/lib/scoring';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import type { GameResult } from '@/types/progress';

const MEDAL_EMOJI: Record<string, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', none: '📚' };

interface CloudProgress {
  profile: { display_name: string; total_xp: number; level: number } | null;
  gameResults: (GameResult & { id: string })[];
}

export default function ProfilePage() {
  const local = useStudentProgress();
  const { user, loading: authLoading } = useAuth();

  const [cloud, setCloud] = useState<CloudProgress | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setCloudLoading(true);
    fetch('/api/progress')
      .then((r) => r.json())
      .then((data) => setCloud(data))
      .catch(() => {})
      .finally(() => setCloudLoading(false));
  }, [user]);

  // When logged in use cloud data, fall back to local
  const totalXp = cloud?.profile?.total_xp ?? local.totalXp;
  const level = cloud?.profile?.level ?? local.level;
  const displayName = cloud?.profile?.display_name ?? user?.user_metadata?.display_name ?? null;

  const rawResults: GameResult[] = cloud
    ? (cloud.gameResults as GameResult[])
    : local.gameResults;

  const recentGames = [...rawResults].slice(0, 10);
  const goldCount = rawResults.filter((r) => r.medal === 'gold').length;

  const xpForNextLevel = getXpForLevel(level);
  const xpInCurrentLevel = totalXp - getXpForLevel(level - 1);
  const xpProgress = Math.min(100, Math.round((xpInCurrentLevel / 100) * 100));

  const isLoading = authLoading || cloudLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav crumbs={[{ label: 'Games', href: '/games' }, { label: 'My Progress' }]} />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {displayName ? `${displayName}'s Progress` : 'My Progress'}
        </h1>
        {!user && !authLoading && (
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-[#1565C0] border border-[#1565C0] px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Sign in to save progress →
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-[#1565C0] text-white rounded-2xl p-6 shadow-md">
            <p className="text-blue-200 text-sm font-medium mb-1">Total XP</p>
            <p className="text-4xl font-extrabold">⚡ {totalXp}</p>
            <p className="text-blue-200 text-sm mt-1">Level {level}</p>
            <div className="mt-3 h-2 bg-blue-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="text-blue-200 text-xs mt-1">{xpInCurrentLevel} / 100 XP to Level {level + 1}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium mb-1">Games Completed</p>
            <p className="text-4xl font-extrabold text-gray-800">{rawResults.length}</p>
            <p className="text-gray-400 text-sm mt-1">Total games played</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium mb-1">Gold Medals</p>
            <p className="text-4xl font-extrabold text-yellow-500">🥇 {goldCount}</p>
            <p className="text-gray-400 text-sm mt-1">Keep going!</p>
          </div>
        </div>
      )}

      {user && (
        <div className="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <span>✓</span>
          <span>Progress saved to your account — accessible from any device.</span>
        </div>
      )}

      <h2 className="text-xl font-extrabold text-gray-800 mb-4">Recent Games</h2>
      {recentGames.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🎮</p>
          <p className="font-semibold text-gray-600">No games played yet!</p>
          <Link href="/games" className="inline-block mt-4 bg-[#1565C0] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#0D47A1] transition-colors">
            Start Playing →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentGames.map((result, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <span className="text-2xl">{MEDAL_EMOJI[result.medal]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{result.topic} — Game {result.gameNumber}</p>
                <p className="text-gray-400 text-xs">{result.subject} • Grade {result.grade}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-extrabold text-[#1565C0]">{result.score}/{result.totalQuestions}</p>
                <div className="flex gap-0.5 justify-end mt-0.5">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className={`text-sm ${s <= result.stars ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-green-600 font-semibold">+{result.xpEarned} XP</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!user && rawResults.length > 0 && (
        <div className="mt-6 text-center bg-blue-50 border border-blue-200 rounded-2xl px-6 py-6">
          <p className="text-gray-700 font-semibold mb-2">Want to save your progress forever?</p>
          <p className="text-gray-500 text-sm mb-4">You&apos;re currently playing as a guest. Create a free account to keep your XP and results.</p>
          <Link href="/auth/signup" className="inline-block bg-[#1565C0] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#0D47A1] transition-colors">
            Create Free Account →
          </Link>
        </div>
      )}
    </div>
  );
}
