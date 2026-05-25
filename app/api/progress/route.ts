import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [profileRes, sessionsRes, topicRes] = await Promise.all([
    supabase.from('profiles').select('display_name, total_xp, level').eq('id', user.id).single(),
    supabase.from('game_sessions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }),
    supabase.from('topic_progress').select('*').eq('user_id', user.id),
  ]);

  return NextResponse.json({
    profile:       profileRes.data,
    gameResults:   sessionsRes.data ?? [],
    topicProgress: topicRes.data ?? [],
  });
}
