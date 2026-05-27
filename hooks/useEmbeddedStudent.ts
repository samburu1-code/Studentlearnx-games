'use client';
import { useEffect, useState } from 'react';

export interface EmbeddedStudent {
  email: string;
  name?: string;
  grade?: number;
}

const STORAGE_KEY = 'slx_embedded_student';

/**
 * Reads the embedded student's identity from URL query params on first load
 * (?student_email=…&student_name=…&student_grade=…) and persists to
 * sessionStorage so the identity survives client-side navigation.
 *
 * Returns null in non-embedded mode (no email provided).
 */
export function useEmbeddedStudent(): EmbeddedStudent | null {
  const [student, setStudent] = useState<EmbeddedStudent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const email = params.get('student_email');
    const name = params.get('student_name') || undefined;
    const gradeStr = params.get('student_grade');
    const grade = gradeStr ? parseInt(gradeStr, 10) : undefined;

    if (email) {
      const next: EmbeddedStudent = { email, name, grade };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStudent(next);
      return;
    }

    // Fall back to stored value if URL didn't include one (e.g. after nav)
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setStudent(JSON.parse(stored) as EmbeddedStudent);
      } catch {
        // ignore
      }
    }
  }, []);

  return student;
}

/** Read the embedded student synchronously (e.g. inside event handlers). */
export function getEmbeddedStudent(): EmbeddedStudent | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as EmbeddedStudent;
  } catch {
    return null;
  }
}
