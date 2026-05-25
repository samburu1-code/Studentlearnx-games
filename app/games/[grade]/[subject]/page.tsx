import Link from 'next/link';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import { SUBJECT_META } from '@/lib/questions';

const TOPICS_MANIFEST: Record<string, Record<string, { name: string; slug: string; totalGames: number; topicNumber: number }[]>> = {
  '7': {
    physics: [
      { name: 'Forces & Motion', slug: 'forces-motion', totalGames: 1, topicNumber: 1 },
      { name: 'Energy', slug: 'energy', totalGames: 1, topicNumber: 2 },
      { name: 'Light', slug: 'light', totalGames: 1, topicNumber: 3 },
      { name: 'Sound', slug: 'sound', totalGames: 1, topicNumber: 4 },
      { name: 'Earth & Space', slug: 'earth-space', totalGames: 1, topicNumber: 5 },
    ],
    chemistry: [
      { name: 'States of Matter', slug: 'states-of-matter', totalGames: 1, topicNumber: 1 },
      { name: 'Separation Techniques', slug: 'separation', totalGames: 1, topicNumber: 2 },
      { name: 'Chemical Reactions', slug: 'reactions', totalGames: 1, topicNumber: 3 },
      { name: 'Acids & Alkalis', slug: 'acids-alkalis', totalGames: 1, topicNumber: 4 },
    ],
    biology: [
      { name: 'Cells', slug: 'cells', totalGames: 1, topicNumber: 1 },
      { name: 'Cell Division', slug: 'cell-division', totalGames: 1, topicNumber: 2 },
      { name: 'Photosynthesis', slug: 'photosynthesis', totalGames: 1, topicNumber: 3 },
      { name: 'Respiration', slug: 'respiration', totalGames: 1, topicNumber: 4 },
      { name: 'Healthy Lifestyle', slug: 'healthy-lifestyle', totalGames: 1, topicNumber: 5 },
    ],
    english: [
      { name: 'Tenses Review', slug: 'tenses-review', totalGames: 1, topicNumber: 1 },
      { name: 'Reported Speech', slug: 'reported-speech', totalGames: 1, topicNumber: 2 },
      { name: 'Reading Articles', slug: 'reading-articles', totalGames: 1, topicNumber: 3 },
      { name: 'Persuasive Writing', slug: 'persuasive-writing', totalGames: 1, topicNumber: 4 },
      { name: 'Academic Vocabulary', slug: 'academic-vocabulary', totalGames: 1, topicNumber: 5 },
      { name: 'Sentence Variety', slug: 'sentence-variety', totalGames: 1, topicNumber: 6 },
      { name: 'Critical Reading', slug: 'critical-reading', totalGames: 1, topicNumber: 7 },
    ],
    math: [
      { name: 'Number & Algebra', slug: 'number-algebra', totalGames: 1, topicNumber: 1 },
      { name: 'Geometry', slug: 'geometry', totalGames: 1, topicNumber: 2 },
      { name: 'Statistics', slug: 'statistics', totalGames: 1, topicNumber: 3 },
      { name: 'Ratios & Proportions', slug: 'ratios-proportions', totalGames: 1, topicNumber: 4 },
      { name: 'Equations', slug: 'equations', totalGames: 1, topicNumber: 5 },
    ],
  },
  '10': {
    physics: [
      { name: 'Motion & Forces', slug: 'motion-forces', totalGames: 1, topicNumber: 1 },
      { name: 'Energy', slug: 'energy', totalGames: 1, topicNumber: 2 },
      { name: 'Magnetism & EM', slug: 'magnetism-em', totalGames: 1, topicNumber: 5 },
    ],
    chemistry: [
      { name: 'States of Matter & Kinetic Theory', slug: 'states-kinetic', totalGames: 1, topicNumber: 1 },
      { name: 'Atoms & Periodic Table', slug: 'atoms-periodic', totalGames: 1, topicNumber: 2 },
      { name: 'Bonding', slug: 'bonding', totalGames: 1, topicNumber: 3 },
      { name: 'Stoichiometry', slug: 'stoichiometry', totalGames: 1, topicNumber: 4 },
      { name: 'Acids & Bases', slug: 'acids-bases', totalGames: 1, topicNumber: 5 },
      { name: 'Salts', slug: 'salts', totalGames: 1, topicNumber: 6 },
    ],
    biology: [
      { name: 'Characteristics & Classification', slug: 'characteristics-classification', totalGames: 1, topicNumber: 1 },
      { name: 'Cells & Movement', slug: 'cells-movement', totalGames: 1, topicNumber: 2 },
      { name: 'Biomolecules & Enzymes', slug: 'biomolecules-enzymes', totalGames: 1, topicNumber: 3 },
      { name: 'Plant Nutrition', slug: 'plant-nutrition', totalGames: 1, topicNumber: 4 },
      { name: 'Animal Nutrition', slug: 'animal-nutrition', totalGames: 1, topicNumber: 5 },
      { name: 'Transport', slug: 'transport', totalGames: 1, topicNumber: 6 },
    ],
    english: [
      { name: 'Reading Comprehension & Analysis', slug: 'reading-comprehension', totalGames: 1, topicNumber: 1 },
      { name: 'Directed Writing', slug: 'directed-writing', totalGames: 1, topicNumber: 2 },
      { name: 'Composition Writing', slug: 'composition-writing', totalGames: 1, topicNumber: 3 },
      { name: 'Summary Writing', slug: 'summary-writing', totalGames: 1, topicNumber: 4 },
      { name: 'Argumentative Writing', slug: 'argumentative-writing', totalGames: 1, topicNumber: 5 },
      { name: 'Language Analysis & Imagery', slug: 'language-analysis', totalGames: 1, topicNumber: 6 },
      { name: 'Grammar & Punctuation', slug: 'grammar-punctuation', totalGames: 1, topicNumber: 7 },
    ],
  },
  '1': {
    english: [
      { name: 'Phonics & Sight Words', slug: 'phonics-sight-words', totalGames: 1, topicNumber: 1 },
      { name: 'Capitals & Full Stops', slug: 'capitals-fullstops', totalGames: 1, topicNumber: 2 },
      { name: 'Verbs & Plurals', slug: 'verbs-plurals', totalGames: 1, topicNumber: 3 },
      { name: 'Reading Comprehension', slug: 'reading-comprehension', totalGames: 1, topicNumber: 4 },
      { name: 'Sounds & Rhymes', slug: 'sounds-rhymes', totalGames: 1, topicNumber: 5 },
      { name: 'Vocabulary', slug: 'vocabulary', totalGames: 1, topicNumber: 6 },
      { name: 'Comparing & Describing', slug: 'compare-describe', totalGames: 1, topicNumber: 7 },
    ],
  },
  '11': {
    physics: [
      { name: 'Kinematics', slug: 'kinematics', totalGames: 1, topicNumber: 2 },
      { name: 'Dynamics', slug: 'dynamics', totalGames: 1, topicNumber: 3 },
      { name: 'Forces, Density & Pressure', slug: 'forces-density-pressure', totalGames: 1, topicNumber: 4 },
      { name: 'Work, Energy & Power', slug: 'work-energy-power', totalGames: 1, topicNumber: 5 },
      { name: 'Deformation of Solids', slug: 'deformation-of-solids', totalGames: 1, topicNumber: 6 },
      { name: 'Waves', slug: 'waves', totalGames: 1, topicNumber: 7 },
      { name: 'Superposition', slug: 'superposition', totalGames: 1, topicNumber: 8 },
      { name: 'Electricity', slug: 'electricity', totalGames: 1, topicNumber: 9 },
      { name: 'DC Circuits', slug: 'dc-circuits', totalGames: 1, topicNumber: 10 },
      { name: 'Particle Physics', slug: 'particle-physics', totalGames: 1, topicNumber: 11 },
    ],
  },
  '12': {
    physics: [
      { name: 'Motion in a Circle', slug: 'motion-in-a-circle', totalGames: 1, topicNumber: 12 },
      { name: 'Gravitational Fields', slug: 'gravitational-fields', totalGames: 1, topicNumber: 13 },
      { name: 'Temperature', slug: 'temperature', totalGames: 1, topicNumber: 14 },
      { name: 'Ideal Gases', slug: 'ideal-gases', totalGames: 1, topicNumber: 15 },
      { name: 'Thermodynamics', slug: 'thermodynamics', totalGames: 1, topicNumber: 16 },
      { name: 'Oscillations', slug: 'oscillations', totalGames: 1, topicNumber: 17 },
      { name: 'Electric Fields', slug: 'electric-fields', totalGames: 1, topicNumber: 18 },
      { name: 'Capacitance', slug: 'capacitance', totalGames: 1, topicNumber: 19 },
      { name: 'Magnetic Fields', slug: 'magnetic-fields', totalGames: 1, topicNumber: 20 },
      { name: 'Alternating Currents', slug: 'alternating-currents', totalGames: 1, topicNumber: 21 },
      { name: 'Quantum Physics', slug: 'quantum-physics', totalGames: 1, topicNumber: 22 },
      { name: 'Nuclear Physics', slug: 'nuclear-physics', totalGames: 1, topicNumber: 23 },
      { name: 'Medical Physics', slug: 'medical-physics', totalGames: 1, topicNumber: 24 },
      { name: 'Astronomy', slug: 'astronomy', totalGames: 1, topicNumber: 25 },
    ],
  },
};

export default async function SubjectPage({ params }: { params: Promise<{ grade: string; subject: string }> }) {
  const { grade, subject } = await params;
  const gradeNum = parseInt(grade);
  const subjectMeta = SUBJECT_META[subject] || { color: '#1565C0', icon: '📖', label: subject };
  const topics = TOPICS_MANIFEST[grade]?.[subject] || [];
  const subjectLabel = subjectMeta.label || subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav crumbs={[
        { label: 'Games', href: '/games' },
        { label: `Grade ${grade}`, href: `/games/${grade}` },
        { label: subjectLabel },
      ]} />

      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{subjectMeta.icon}</span>
        <h1 className="text-3xl font-extrabold text-gray-900">{subjectLabel}</h1>
      </div>
      <p className="text-gray-500 mb-10">Grade {grade} • Select a topic to start playing.</p>

      {topics.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🚧</p>
          <p className="text-lg font-semibold text-gray-500">Coming Soon</p>
          <p className="text-sm mt-2 text-gray-400">Topics for Grade {grade} {subjectLabel} are being prepared.</p>
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
                <span className="text-xs font-medium text-gray-400">{topic.totalGames} game{topic.totalGames !== 1 ? 's' : ''}</span>
              </div>
              <h3 className="font-extrabold text-gray-800 text-base leading-snug mb-1">{topic.name}</h3>
              <p className="text-sm text-gray-400">Topic {topic.topicNumber} → Start →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
