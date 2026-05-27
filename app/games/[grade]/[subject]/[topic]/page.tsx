import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import GameTilesGrid from '@/components/navigation/GameTilesGrid';
import { SUBJECT_META, subjectSlugToName } from '@/lib/questions';
import { createClient } from '@/lib/supabase/server';

async function getTopicInfo(grade: number, subject: string, topicSlug: string) {
  const supabase = await createClient();
  const subjectName = subjectSlugToName(subject);

  // Get max game_number and topic name in one query
  const { data } = await supabase
    .from('questions')
    .select('topic, topic_number, game_number')
    .eq('grade', grade)
    .eq('subject', subjectName)
    .eq('topic_slug', topicSlug)
    .order('game_number', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;

  return {
    name: data[0].topic as string,
    topicNumber: (data[0].topic_number as number) ?? 0,
    totalGames: data[0].game_number as number,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ grade: string; subject: string; topic: string }>;
}) {
  const { grade, subject, topic } = await params;
  const gradeNum = parseInt(grade);
  const subjectMeta = SUBJECT_META[subject] || { color: '#1565C0', icon: '📖', label: subject };
  const subjectLabel =
    subjectMeta.label || subject.charAt(0).toUpperCase() + subject.slice(1);

  const topicInfo = await getTopicInfo(gradeNum, subject, topic);
  const topicName =
    topicInfo?.name ||
    topic
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  const totalGames = topicInfo?.totalGames ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        crumbs={[
          { label: 'Games', href: '/games' },
          { label: `Grade ${grade}`, href: `/games/${grade}` },
          { label: subjectLabel, href: `/games/${grade}/${subject}` },
          { label: topicName },
        ]}
      />

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{subjectMeta.icon}</span>
        <h1 className="text-2xl font-extrabold text-gray-900">{topicName}</h1>
      </div>
      <p className="text-gray-500 mb-8">
        Grade {grade} {subjectLabel} •{' '}
        {totalGames > 0
          ? `${totalGames} game${totalGames > 1 ? 's' : ''}`
          : 'Coming soon'}
      </p>

      {totalGames === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🚧</p>
          <p className="text-lg font-semibold text-gray-500">Questions Coming Soon</p>
          <p className="text-sm mt-2 text-gray-400">
            This topic is being prepared. Check back soon!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-1 text-sm uppercase tracking-wide">
              How to play
            </h2>
            <p className="text-gray-500 text-sm">
              Each game has 10 questions. Answer correctly to earn XP and stars. Complete all{' '}
              {totalGames} game{totalGames > 1 ? 's' : ''} to earn your topic certificate!
            </p>
          </div>

          <GameTilesGrid
            grade={gradeNum}
            subject={subjectSlugToName(subject)}
            subjectSlug={subject}
            topic={topic}
            topicSlug={topic}
            totalGames={totalGames}
            subjectColor={subjectMeta.color}
          />
        </>
      )}
    </div>
  );
}
