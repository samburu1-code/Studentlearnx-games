'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmbeddedStudent } from '@/hooks/useEmbeddedStudent';
import { useStudentProgress } from '@/hooks/useStudentProgress';

/**
 * Invisible component mounted at the root. Loads cloud-saved progress into
 * the Zustand store under either of these conditions:
 *   1. Embedded mode — student_email passed from parent site via iframe URL
 *   2. Authenticated mode — user signed in via Supabase Auth on the games site
 *
 * Clears local progress when a previously-identified student goes away
 * (e.g. iframe URL changed, or user signed out).
 */
export default function ProgressSync() {
  const { user, loading } = useAuth();
  const embedded = useEmbeddedStudent();
  const loadFromServer = useStudentProgress((s) => s.loadFromServer);
  const resetProgress = useStudentProgress((s) => s.resetProgress);
  const lastIdentity = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const identity = embedded?.email ?? user?.id ?? null;
    if (identity === lastIdentity.current) return;
    lastIdentity.current = identity;

    if (identity) {
      loadFromServer();
    } else {
      resetProgress();
    }
  }, [user, loading, embedded, loadFromServer, resetProgress]);

  return null;
}
