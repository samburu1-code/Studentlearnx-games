import Link from 'next/link';

const SUBJECTS = [
  { label: 'Physics', icon: '⚛️', color: '#1565C0', bg: '#E3F2FD', grades: '7–12' },
  { label: 'Chemistry', icon: '🧪', color: '#7B1FA2', bg: '#F3E5F5', grades: '7–12' },
  { label: 'Biology', icon: '🧬', color: '#2E7D32', bg: '#E8F5E9', grades: '7–12' },
  { label: 'English', icon: '📚', color: '#E65100', bg: '#FFF3E0', grades: '1–12' },
  { label: 'Math', icon: '📐', color: '#AD1457', bg: '#FCE4EC', grades: '1–11' },
];

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#1565C0] to-[#0D47A1] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Smarter Learning for<br />
              <span className="text-yellow-300">Grades 1–12</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Master Physics, Chemistry, Biology, Math, and English through interactive quiz games.
              Earn XP, collect medals, and track your progress.
            </p>
            <Link
              href="/games"
              className="inline-block bg-white text-[#1565C0] font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-base"
            >
              Start Playing →
            </Link>
          </div>
        </div>
        <div className="bg-[#0D47A1] border-t border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap justify-center md:justify-start gap-8 text-center">
              {[
                { value: '10,000+', label: 'Questions' },
                { value: '5', label: 'Subjects' },
                { value: 'Grades 1–12', label: 'All Levels' },
                { value: 'Free', label: 'Always' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-blue-300 text-xs font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse by Subject</h2>
        <p className="text-gray-500 mb-8">Choose a subject to explore topics and start a game.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SUBJECTS.map((s) => (
            <Link
              key={s.label}
              href={`/games?subject=${s.label.toLowerCase()}`}
              className="rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: s.bg }}
            >
              <span className="text-4xl block mb-3">{s.icon}</span>
              <p className="font-bold text-gray-800 text-sm">{s.label}</p>
              <p className="text-xs text-gray-500 mt-1">Grade {s.grades}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse by Grade</h2>
        <p className="text-gray-500 mb-8">Select your grade to see available subjects and topics.</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
          {GRADES.map((g) => (
            <Link
              key={g}
              href={`/games/${g}`}
              className="aspect-square flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#1565C0] hover:shadow-md transition-all group"
            >
              <span className="text-lg font-extrabold text-[#1565C0] group-hover:scale-110 transition-transform">{g}</span>
              <span className="text-[10px] text-gray-400 font-medium">Grade</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#1565C0] to-[#7B1FA2] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-extrabold mb-3">Earn Rewards as You Learn</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Answer questions correctly to earn XP, unlock medals, and track your streak. Complete all games in a topic to earn a certificate!</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: '⚡', label: 'XP Points', desc: '+10 per correct answer' },
              { icon: '🥇', label: 'Gold Medal', desc: '100% score' },
              { icon: '🔥', label: 'Streaks', desc: '3+ correct in a row' },
              { icon: '📜', label: 'Certificate', desc: 'Complete all games' },
            ].map((r) => (
              <div key={r.label} className="text-center">
                <span className="text-3xl block mb-2">{r.icon}</span>
                <p className="font-bold text-sm">{r.label}</p>
                <p className="text-blue-200 text-xs mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
