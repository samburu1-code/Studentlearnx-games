import Link from 'next/link';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';

const SUBJECTS_FOR_GRADE: Record<number, { subject: string; icon: string; color: string; bg: string; slug: string; topicCount: number }[]> = {
  1: [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 7 }],
  2: [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 9 }, { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 5 }],
  3: [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 7 }, { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 5 }],
  5: [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 5 }, { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 5 }],
  7: [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics', topicCount: 5 },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry', topicCount: 5 },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology', topicCount: 5 },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 7 },
    { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 5 },
  ],
  8: [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics', topicCount: 5 },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry', topicCount: 5 },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology', topicCount: 6 },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 5 },
    { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 5 },
  ],
  9: [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics', topicCount: 5 },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry', topicCount: 5 },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology', topicCount: 5 },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 7 },
    { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 5 },
  ],
  10: [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics', topicCount: 3 },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry', topicCount: 6 },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology', topicCount: 6 },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 7 },
    { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 6 },
  ],
  11: [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics', topicCount: 10 },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry', topicCount: 12 },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology', topicCount: 10 },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 7 },
    { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', topicCount: 6 },
  ],
  12: [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics', topicCount: 14 },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry', topicCount: 12 },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology', topicCount: 12 },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', topicCount: 7 },
  ],
};

export default async function GradePage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  const gradeNum = parseInt(grade);
  const subjects = SUBJECTS_FOR_GRADE[gradeNum] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav crumbs={[{ label: 'Games', href: '/games' }, { label: `Grade ${grade}` }]} />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Grade {grade}</h1>
      <p className="text-gray-500 mb-10">Select a subject to see available topics and games.</p>

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
                <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: s.color }}>
                  {s.topicCount} Topics
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-gray-800">{s.subject}</h3>
              <p className="text-sm text-gray-500 mt-1">Grade {grade} • Explore topics →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
