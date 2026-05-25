import Link from 'next/link';

const SUBJECTS_BY_GRADE: Record<string, { subject: string; icon: string; color: string; bg: string; slug: string }[]> = {
  '1': [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' }],
  '2': [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' }],
  '3': [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' }],
  '4': [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' }],
  '5': [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' }, { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math' }],
  '6': [{ subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' }, { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math' }],
  '7': [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics' },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry' },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology' },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' },
    { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math' },
  ],
  '10': [
    { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics' },
    { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry' },
    { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology' },
    { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english' },
    { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math' },
  ],
};

const ALL_SUBJECTS = [
  { subject: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', slug: 'physics', grades: [7, 8, 9, 10, 11, 12] },
  { subject: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', slug: 'chemistry', grades: [7, 8, 9, 10, 11, 12] },
  { subject: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', slug: 'biology', grades: [7, 8, 9, 10, 11, 12] },
  { subject: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', slug: 'english', grades: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12] },
  { subject: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', slug: 'math', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
];

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">All Games</h1>
      <p className="text-gray-500 mb-10">Choose a subject and grade to start practising.</p>

      {ALL_SUBJECTS.map((subject) => (
        <div key={subject.slug} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{subject.icon}</span>
            <h2 className="text-xl font-extrabold text-gray-800">{subject.subject}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {subject.grades.map((grade) => (
              <Link
                key={grade}
                href={`/games/${grade}/${subject.slug}`}
                className="px-5 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
                style={{ backgroundColor: subject.color }}
              >
                Grade {grade}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
