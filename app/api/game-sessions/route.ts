import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getLevelFromXp } from '@/lib/scoring';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { error: sessionError } = await supabase.from('game_sessions').insert({
    user_id:         user.id,
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
    best_streak:     body.bestStreak,
    completed_at:    body.completedAt,
  });

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  // Upsert topic progress (merge with existing row)
  const { data: existingTp } = await supabase
    .from('topic_progress')
    .select('games_completed, total_stars, max_stars, xp_earned')
    .eq('user_id', user.id)
    .eq('grade', body.grade)
    .eq('subject', body.subject)
    .eq('topic_slug', body.topicSlug)
    .maybeSingle();

  await supabase.from('topic_progress').upsert({
    user_id:           user.id,
    grade:             body.grade,
    subject:           body.subject,
    topic_slug:        body.topicSlug,
    games_completed:   (existingTp?.games_completed ?? 0) + 1,
    total_stars:       (existingTp?.total_stars ?? 0) + body.stars,
    max_stars:         (existingTp?.max_stars ?? 0) + 3,
    xp_earned:         (existingTp?.xp_earned ?? 0) + body.xpEarned,
    updated_at:        new Date().toISOString(),
  }, { onConflict: 'user_id,grade,subject,topic_slug' });

  // Update profile XP + level
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp')
    .eq('id', user.id)
    .single();

  const newXp = (profile?.total_xp ?? 0) + body.xpEarned;
  await supabase.from('profiles').update({
    total_xp:   newXp,
    level:      getLevelFromXp(newXp),
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);

  return NextResponse.json({ ok: true });
}
