/**
 * StudentLearnX Games — PDF Question Extractor (multi-format)
 *
 * Handles 4 Cambridge curriculum formats:
 *   - A-Level (Grade 12): "P2_Q001 · ... Difficulty: easy · ... QUESTION: ... A. ... Correct answer: A  Solution. ..."
 *   - Primary (Grade 1-6): "P1T1_Q001 · ... EASY ... · Primary Stage 1 Number 1Nn  Q text  A. ... ✓ Correct answer: A"
 *   - Lower Sec (Grade 7-9): "PY7T1_Q001 · ... EASY ... · Lower Sec Physics Stage 7 7Pf.01  Q text  A. ... ✓ Correct answer: A"
 *   - IGCSE (Grade 10-11): "IGB1_Q001 · ... EASY ... · IGCSE Biology 0610 / 0970 Topic 1  Q text  A. ... ✓ Correct answer: A"
 *
 * Usage:
 *   node scripts/extract-pdf.cjs --pdf "PATH" --grade 12 --subject Physics --topic "Kinematics" --topic-slug kinematics --topic-number 2 --out output.sql
 */

const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const pdfPath = arg('pdf');
const grade = parseInt(arg('grade'), 10);
const subject = arg('subject');
const topic = arg('topic');
const topicSlug = arg('topic-slug');
const topicNumberArg = arg('topic-number');
const topicNumber = topicNumberArg ? parseInt(topicNumberArg, 10) : null;
const outFile = arg('out', 'questions.sql');

if (!pdfPath || !grade || !subject || !topic || !topicSlug) {
  console.error('Missing required args. Need: --pdf --grade --subject --topic --topic-slug [--topic-number] --out');
  process.exit(1);
}

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''").trim());

// Question ID pattern — matches all 4 formats
const QUESTION_ID = /\b([A-Z]{1,4}\d*[A-Z]?\d*T?\d*)_Q(\d{3})\b/g;

function parseBlock(block) {
  // Extract question number
  const idM = block.match(/_Q(\d{3})\b/);
  if (!idM) return null;
  const qNum = parseInt(idM[1], 10);

  // Difficulty: either "Difficulty: easy" or standalone "EASY"
  let difficulty = 'medium';
  const d1 = block.match(/Difficulty:\s*(easy|medium|hard)/i);
  const d2 = block.match(/\b(EASY|MEDIUM|HARD)\b/);
  if (d1) difficulty = d1[1].toLowerCase();
  else if (d2) difficulty = d2[1].toLowerCase();

  // Options A, B, C, D
  const optA = block.match(/\sA\.\s+([\s\S]+?)\s+B\.\s+/);
  const optB = block.match(/\sB\.\s+([\s\S]+?)\s+C\.\s+/);
  const optC = block.match(/\sC\.\s+([\s\S]+?)\s+D\.\s+/);
  // D goes until "✓ Correct" or just "Correct"
  const optD = block.match(/\sD\.\s+([\s\S]+?)\s+(?:✓\s*)?Correct answer:/);
  if (!optA || !optB || !optC || !optD) return null;

  // Correct answer (with optional ✓ check mark)
  const correctMatch = block.match(/(?:✓\s*)?Correct answer:\s*([ABCD])/);
  if (!correctMatch) return null;
  const correct = correctMatch[1];

  // Solution / explanation (stop at next question, page header, or end)
  const solMatch = block.match(/Solution\.\s*([\s\S]+?)(?=\s+[A-Z]{1,4}\d*[A-Z]?\d*T?\d*_Q\d{3}|\s+Page\s+\d+\s+|\s*$)/);
  let explanation = solMatch ? solMatch[1].replace(/\s+/g, ' ').trim() : null;
  if (explanation) {
    // Strip any trailing "[Topic Name] Page N [Topic Name]" residue
    explanation = explanation.replace(/\s+[\w\s\(\)\.,'&\-]+?\s+Page\s+\d+.*$/, '').trim();
    // Also strip lone trailing "Topic Name" remnants (rare)
    if (explanation.length === 0) explanation = null;
  }

  // Question text — most complex part. Three patterns to try.
  let questionText = null;

  // Pattern 1: Grade 12 A-Level — "QUESTION: [text] A."
  const q1 = block.match(/QUESTION:\s+([\s\S]+?)\s+A\.\s+/);
  if (q1) {
    questionText = q1[1].replace(/\s+/g, ' ').trim();
  } else {
    // Pattern 2 & 3: No QUESTION: prefix — find text between "Marks: N" (+ optional ref) and "A."
    const aIdx = block.search(/\sA\.\s+/);
    if (aIdx > 0) {
      const before = block.slice(0, aIdx);
      const lastMarks = [...before.matchAll(/Marks:\s*\d+/g)].pop();
      if (lastMarks) {
        let candidate = before.slice(lastMarks.index + lastMarks[0].length).trim();

        // Strip leading curriculum reference
        // e.g.: "· Primary Stage 1 Number 1Nn", "· Lower Sec Physics Stage 7 7Pf.01",
        //       "· IGCSE Biology 0610 / 0970 Topic 1", "· Topic 1"
        if (candidate.startsWith('·')) {
          candidate = candidate.slice(1).trim();
          const refPatterns = [
            /^Primary Stage \d+ [\w\s]+? [\w\d\.]+\s+(?=\S)/,
            /^Lower Sec [\w\s]+? Stage \d+ [\w\d\.]+\s+(?=\S)/,
            /^IGCSE [\w\s]+? \d+\s*\/\s*\d+ Topic \d+\s+(?=\S)/,
            /^[\w\s\/]+? Topic \d+\s+(?=\S)/,
            /^[\w\s]+? \d[A-Za-z]+\.?\d*\s+(?=\S)/, // ends with code like "7Pf.01" or "1Nn"
            /^[\w\s\/]+?\s+(?=[A-Z])/, // generic fallback - take until next capital word starts
          ];
          for (const pat of refPatterns) {
            const m = candidate.match(pat);
            if (m) {
              candidate = candidate.slice(m[0].length).trim();
              break;
            }
          }
        }
        questionText = candidate.replace(/\s+/g, ' ').trim();
      }
    }
  }

  if (!questionText || questionText.length < 3) return null;

  return {
    question_number: qNum,
    question_text: questionText,
    option_a: optA[1].replace(/\s+/g, ' ').trim(),
    option_b: optB[1].replace(/\s+/g, ' ').trim(),
    option_c: optC[1].replace(/\s+/g, ' ').trim(),
    option_d: optD[1].replace(/\s+/g, ' ').trim(),
    correct_answer: correct,
    explanation,
    difficulty,
  };
}

(async () => {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data, disableFontFace: true }).promise;

  let full = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    full += '\n' + tc.items.map((it) => it.str).join(' ');
  }

  // Strip page headers globally — pattern: "<Topic Name> Page N <Topic Name>"
  // The topic name repeats around "Page N" — use a back-reference to match the duplicate
  full = full.replace(/\s+([A-Z][\w\(\)\s\.,'&\-]{3,100}?)\s+Page\s+\d+\s+\1/g, ' ');
  // Also strip standalone "<Topic Name> Page N" at the start of pages (after the back-ref strip)
  full = full.replace(/\s+[A-Z][\w\(\)\s\.,'&\-]{3,100}?\s+Page\s+\d+\s+/g, ' ');

  // Split into question blocks
  const blocks = full.split(/(?=\b[A-Z]{1,4}\d*[A-Z]?\d*T?\d*_Q\d{3}\b)/);

  const questions = [];
  for (const block of blocks) {
    const parsed = parseBlock(block);
    if (parsed) {
      parsed.grade = grade;
      parsed.subject = subject;
      parsed.topic = topic;
      parsed.topic_slug = topicSlug;
      parsed.topic_number = topicNumber;
      parsed.game_number = Math.ceil(parsed.question_number / 10);
      parsed.source_pdf = path.basename(pdfPath);
      questions.push(parsed);
    }
  }

  console.log(`Parsed ${questions.length} questions from ${path.basename(pdfPath)}`);

  if (questions.length === 0) {
    console.log('No questions parsed — format may differ. Skipping SQL generation.');
    return;
  }

  // Generate SQL
  const lines = [
    `-- Grade ${grade} ${subject} — ${topic} (${questions.length} questions)`,
    `-- Source: ${path.basename(pdfPath)}`,
    '',
    'INSERT INTO public.questions (grade, subject, topic, topic_slug, topic_number, game_number, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, source_pdf) VALUES',
  ];

  const rows = questions.map((q, i) => {
    const comma = i === questions.length - 1 ? '' : ',';
    return `  (${q.grade}, '${esc(q.subject)}', '${esc(q.topic)}', '${esc(q.topic_slug)}', ${q.topic_number ?? 'NULL'}, ${q.game_number}, ${q.question_number}, '${esc(q.question_text)}', '${esc(q.option_a)}', '${esc(q.option_b)}', '${esc(q.option_c)}', '${esc(q.option_d)}', '${q.correct_answer}', ${q.explanation ? `'${esc(q.explanation)}'` : 'NULL'}, '${q.difficulty}', '${esc(q.source_pdf)}')${comma}`;
  });

  lines.push(...rows);
  lines.push('ON CONFLICT (grade, subject, topic_slug, question_number) DO NOTHING;');

  fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
  console.log(`Wrote ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);
})();
