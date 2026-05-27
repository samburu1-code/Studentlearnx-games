import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * GET /api/embed/progress?email=<student_email>
 * Returns all saved progress for an embedded (iframe) student.
 */
export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const email = new URL(request.url).searchParams.get('email')?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'email param required' }, { status: 400 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [studentRes, sessionsRes, topicRes] = await Promise.all([
    supabase
      .from('embedded_students')
      .select('student_name, total_xp, level')
      .eq('student_email', email)
      .maybeSingle(),
    supabase
      .from('embedded_game_sessions')
      .select('*')
      .eq('student_email', email)
      .order('completed_at', { ascending: false }),
    supabase
      .from('embedded_topic_progress')
      .select('*')
      .eq('student_email', email),
  ]);

  return NextResponse.json({
    student:       studentRes.data,
    gameResults:   sessionsRes.data ?? [],
    topicProgress: topicRes.data ?? [],
  });
}
