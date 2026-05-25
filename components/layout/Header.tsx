'use client';
import Link from 'next/link';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/app/auth/actions';

export default function Header() {
  const { totalXp, level } = useStudentProgress();
  const { user, loading } = useAuth();

  return (
    <header className="bg-[#1565C0] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow">
              <span className="text-[#1565C0] font-extrabold text-lg leading-none">S</span>
            </div>
            <div className="leading-tight">
              <span className="text-white font-bold text-lg tracking-tight">StudentLearnX</span>
              <span className="block text-blue-200 text-[10px] font-medium -mt-0.5">Students Learning Solution</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/games" className="text-white/90 hover:text-white font-medium text-sm transition-colors">
              Games
            </Link>
            <Link href="/profile" className="text-white/90 hover:text-white font-medium text-sm transition-colors">
              My Progress
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0D47A1] rounded-full px-3 py-1.5">
              <span className="text-yellow-300 text-sm font-bold">⚡</span>
              <span className="text-white text-sm font-semibold">{totalXp} XP</span>
              <span className="text-blue-300 text-xs">Lv.{level}</span>
            </div>

            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:block text-white/80 text-xs max-w-[100px] truncate">
                    {user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-1.5 rounded-full transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-white text-[#1565C0] font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
