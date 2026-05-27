import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getLevelFromXp } from '@/lib/scoring';

/**
 * POST /api/embed/save
 * Saves a game result for an embedded (iframe) student identified by email.
 * Uses the service-role key so we can bypass RLS — only this route writes.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const email = String(body.student_email ?? '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'student_email required' }, { status: 400 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Ensure student row exists / update display name
  await supabase.from('embedded_students').upsert(
    {
      student_email: email,
      student_name: body.student_name ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'student_email' }
  );

  // 2) Insert game session
  const { error: sessionError } = await supabase.from('embedded_game_sessions').insert({
    student_email:   email,
    grade:           body.grade,
    subject:         body.subject,
    topic:           body.topic,
    topic_slug:      body.topicSlug,
    game_number:     body.gameNumber,
    score:           body.score,
    total_questions: body.totalQuestions,
    stars:           body.stars,
    medal:           body.medal,
    xp_earned:       body.xpEarned,
    best_streak:     body.bestStreak ?? 0,
    completed_at:    body.completedAt ?? new Date().toISOString(),
  });
  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  // 3) Upsert topic_progress (merge with existing)
  const { data: existingTp } = await supabase
    .from('embedded_topic_progress')
    .select('games_completed, total_stars, max_stars, xp_earned')
    .eq('student_email', email)
    .eq('grade', body.grade)
    .eq('subject', body.subject)
    .eq('topic_slug', body.topicSlug)
    .maybeSingle();

  await supabase.from('embedded_topic_progress').upsert(
    {
      student_email:   email,
      grade:           body.grade,
      subject:         body.subject,
      topic_slug:      body.topicSlug,
      games_completed: (existingTp?.games_completed ?? 0) + 1,
      total_stars:     (existingTp?.total_stars ?? 0) + (body.stars ?? 0),
      max_stars:       (existingTp?.max_stars ?? 0) + 3,
      xp_earned:       (existingTp?.xp_earned ?? 0) + (body.xpEarned ?? 0),
      updated_at:      new Date().toISOString(),
    },
    { onConflict: 'student_email,grade,subject,topic_slug' }
  );

  // 4) Update student total XP + level
  const { data: studentRow } = await supabase
    .from('embedded_students')
    .select('total_xp')
    .eq('student_email', email)
    .single();
  const newXp = (studentRow?.total_xp ?? 0) + (body.xpEarned ?? 0);
  await supabase
    .from('embedded_students')
    .update({
      total_xp:   newXp,
      level:      getLevelFromXp(newXp),
      updated_at: new Date().toISOString(),
    })
    .eq('student_email', email);

  return NextResponse.json({ ok: true, totalXp: newXp });
}
