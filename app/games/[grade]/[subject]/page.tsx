import Link from 'next/link';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import { SUBJECT_META, subjectSlugToName } from '@/lib/questions';
import { createClient } from '@/lib/supabase/server';

interface TopicRow {
  name: string;
  slug: string;
  topicNumber: number;
  totalGames: number;
}

async function getTopicsForSubject(grade: number, subject: string): Promise<TopicRow[]> {
  const supabase = await createClient();
  const subjectName = subjectSlugToName(subject);

  const { data, error } = await supabase
    .from('questions')
    .select('topic, topic_slug, topic_number, game_number')
    .eq('grade', grade)
    .eq('subject', subjectName)
    .order('topic_number')
    .order('game_number');

  if (error || !data) return [];

  // Deduplicate by topic_slug, keeping max game_number
  const topicMap = new Map<string, TopicRow>();
  for (const row of data) {
    if (!topicMap.has(row.topic_slug)) {
      topicMap.set(row.topic_slug, {
        name: row.topic,
        slug: row.topic_slug,
        topicNumber: row.topic_number ?? 0,
        totalGames: row.game_number,
      });
    } else {
      const existing = topicMap.get(row.topic_slug)!;
      if (row.game_number > existing.totalGames) {
        existing.totalGames = row.game_number;
      }
    }
  }

  return Array.from(topicMap.values()).sort((a, b) => a.topicNumber - b.topicNumber);
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ grade: string; subject: string }>;
}) {
  const { grade, subject } = await params;
  const gradeNum = parseInt(grade);
  const subjectMeta = SUBJECT_META[subject] || { color: '#1565C0', icon: '📖', label: subject };
  const topics = await getTopicsForSubject(gradeNum, subject);
  const subjectLabel = subjectMeta.label || subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        crumbs={[
          { label: 'Games', href: '/games' },
          { label: `Grade ${grade}`, href: `/games/${grade}` },
          { label: subjectLabel },
        ]}
      />

      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{subjectMeta.icon}</span>
        <h1 className="text-3xl font-extrabold text-gray-900">{subjectLabel}</h1>
      </div>
      <p className="text-gray-500 mb-10">Grade {grade} • Select a topic to start playing.</p>

      {topics.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🚧</p>
          <p className="text-lg font-semibold text-gray-500">Coming Soon</p>
          <p className="text-sm mt-2 text-gray-400">
            Topics for Grade {grade} {subjectLabel} are being prepared.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/games/${grade}/${subject}/${topic.slug}`}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: subjectMeta.color }}
                >
                  T{topic.topicNumber}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {topic.totalGames} game{topic.totalGames !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="font-extrabold text-gray-800 text-base leading-snug mb-1">
                {topic.name}
              </h3>
              <p className="text-sm text-gray-400">Topic {topic.topicNumber} → Start →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
