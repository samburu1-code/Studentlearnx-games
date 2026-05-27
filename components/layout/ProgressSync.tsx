'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStudentProgress } from '@/hooks/useStudentProgress';

/**
 * Invisible component mounted at the root. When the user logs in, it pulls
 * their saved progress from Supabase. When they sign out, it clears local
 * progress so the next user (or guest) starts fresh.
 */
export default function ProgressSync() {
  const { user, loading } = useAuth();
  const loadFromServer = useStudentProgress((s) => s.loadFromServer);
  const resetProgress = useStudentProgress((s) => s.resetProgress);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const currentId = user?.id ?? null;
    if (currentId === lastUserId.current) return; // no change
    lastUserId.current = currentId;

    if (user) {
      // Logged in — pull saved progress from Supabase
      loadFromServer();
    } else {
      // Signed out — clear local cache so we don't leak prev user data
      resetProgress();
    }
  }, [user, loading, loadFromServer, resetProgress]);

  return null;
}
