import Link from 'next/link';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import { createClient } from '@/lib/supabase/server';

const SUBJECT_UI: Record<
  string,
  { icon: string; color: string; bg: string; slug: string }
> = {
  Physics:   { icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics' },
  Chemistry: { icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry' },
  Biology:   { icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology' },
  English:   { icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' },
  Math:      { icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math' },
};

const SUBJECT_ORDER = ['Physics', 'Chemistry', 'Biology', 'English', 'Math'];

async function getSubjectsForGrade(grade: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('questions')
    .select('subject, topic_slug')
    .eq('grade', grade);

  if (error || !data) return [];

  // Count distinct topics per subject
  const subjectTopics = new Map<string, Set<string>>();
  for (const row of data) {
    if (!subjectTopics.has(row.subject)) {
      subjectTopics.set(row.subject, new Set());
    }
    subjectTopics.get(row.subject)!.add(row.topic_slug);
  }

  return SUBJECT_ORDER.filter((s) => subjectTopics.has(s)).map((s) => ({
    subject: s,
    slug: SUBJECT_UI[s].slug,
    icon: SUBJECT_UI[s].icon,
    color: SUBJECT_UI[s].color,
    bg: SUBJECT_UI[s].bg,
    topicCount: subjectTopics.get(s)!.size,
  }));
}

export default async function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade } = await params;
  const gradeNum = parseInt(grade);
  const subjects = await getSubjectsForGrade(gradeNum);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        crumbs={[{ label: 'Games', href: '/games' }, { label: `Grade ${grade}` }]}
      />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Grade {grade}</h1>
      <p className="text-gray-500 mb-10">
        Select a subject to see available topics and games.
      </p>

      {subjects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🚧</p>
          <p className="text-lg font-semibold text-gray-500">Coming Soon</p>
          <p className="text-sm mt-2">Games for Grade {grade} are being prepared.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <Link
              key={s.slug}
              href={`/games/${grade}/${s.slug}`}
              className="group rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: s.bg }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{s.icon}</span>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: s.color }}
                >
                  {s.topicCount} Topics
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-gray-800">{s.subject}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Grade {grade} • Explore topics →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
