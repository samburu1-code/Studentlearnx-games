/**
 * StudentLearnX Games — Batch PDF Extractor
 *
 * Scans the Cloude Depository file folder, derives metadata from each PDF's
 * path + filename, runs the parser, and writes one SQL file per subject-grade.
 *
 * Output: scripts/output/by-subject/<subject>-grade-<N>.sql
 */

const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\sambu\\OneDrive\\Desktop\\Cloude Depository file';
const SUBJECT_DIRS = ['Math', 'Physics', 'Biology', 'Chemistry', 'English'];
const OUT_DIR = path.join(__dirname, 'output', 'by-subject');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''").trim());

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

/**
 * Derive metadata from a PDF's full path + filename.
 * Returns null if we can't parse it.
 */
function deriveMetadata(pdfPath) {
  const rel = pdfPath.replace(ROOT + path.sep, '');
  const parts = rel.split(path.sep);
  const filename = path.basename(pdfPath, '.pdf');

  // Subject from top-level folder
  const subject = parts[0];

  // Grade from folder path (e.g., "Grade 7 Physics" or "Chemistry Grade 10")
  const gradeMatch = rel.match(/Grade\s+(\d+)/);
  if (!gradeMatch) return null;
  const grade = parseInt(gradeMatch[1], 10);

  // Topic number from filename (e.g., "topic_2_kinematics", "topic1_counting", "topic_1_quantities_units")
  const topicNumMatch = filename.match(/topic[_\s]*(\d+)/i);
  const topicNumber = topicNumMatch ? parseInt(topicNumMatch[1], 10) : null;

  // Topic slug from filename — strip the prefix junk, keep just the topic part
  // Examples:
  //  - "physics_topic_2_kinematics" → "kinematics"
  //  - "Grade 1 primary_stage1_topic1_counting" → "counting"
  //  - "Grade 7 lower_sec_phys_stage7_topic1_forces_motion" → "forces_motion"
  //  - "Grade 10 igcse_bio_topic1_characteristics_classification" → "characteristics_classification"
  //  - "Grade 8 lower_sec_phys_stage8_topic5_light_waves (1)" → "light_waves"
  let rawTopic = filename;
  // Remove the prefix up to and including "topic_N_" or "topicN_"
  const after = rawTopic.match(/topic[_\s]*\d+[_\s]+(.+?)(?:\s*\(\d+\))?$/i);
  if (!after) return null;
  let topicSlug = after[1].trim().replace(/\s+/g, '_').toLowerCase();
  // Clean
  topicSlug = topicSlug.replace(/[^\w]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  // Human-readable topic name from slug
  const topic = titleCase(topicSlug);

  return {
    grade,
    subject,
    topic,
    topicSlug: slugify(topic),
    topicNumber,
    pdfPath,
  };
}

function walkPdfs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkPdfs(fp));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      out.push(fp);
    }
  }
  return out;
}

async function parsePdf(pdfPath) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data, disableFontFace: true }).promise;

  let full = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    full += '\n' + tc.items.map((it) => it.str).join(' ');
  }

  // Strip page headers
  full = full.replace(/\s+([A-Z][\w\(\)\s\.,'&\-]{3,100}?)\s+Page\s+\d+\s+\1/g, ' ');
  full = full.replace(/\s+[A-Z][\w\(\)\s\.,'&\-]{3,100}?\s+Page\s+\d+\s+/g, ' ');

  const blocks = full.split(/(?=\b[A-Z]{1,4}\d*[A-Z]?\d*T?\d*_Q\d{3}\b)/);

  const questions = [];
  for (const block of blocks) {
    const idM = block.match(/_Q(\d{3})\b/);
    if (!idM) continue;
    const qNum = parseInt(idM[1], 10);

    let difficulty = 'medium';
    const d1 = block.match(/Difficulty:\s*(easy|medium|hard)/i);
    const d2 = block.match(/\b(EASY|MEDIUM|HARD)\b/);
    if (d1) difficulty = d1[1].toLowerCase();
    else if (d2) difficulty = d2[1].toLowerCase();

    const optA = block.match(/\sA\.\s+([\s\S]+?)\s+B\.\s+/);
    const optB = block.match(/\sB\.\s+([\s\S]+?)\s+C\.\s+/);
    const optC = block.match(/\sC\.\s+([\s\S]+?)\s+D\.\s+/);
    const optD = block.match(/\sD\.\s+([\s\S]+?)\s+(?:✓\s*)?Correct answer:/);
    if (!optA || !optB || !optC || !optD) continue;

    const correctMatch = block.match(/(?:✓\s*)?Correct answer:\s*([ABCD])/);
    if (!correctMatch) continue;

    const solMatch = block.match(/Solution\.\s*([\s\S]+?)(?=\s+[A-Z]{1,4}\d*[A-Z]?\d*T?\d*_Q\d{3}|\s*$)/);
    let explanation = solMatch ? solMatch[1].replace(/\s+/g, ' ').trim() : null;
    if (explanation && explanation.length === 0) explanation = null;

    let questionText = null;
    const q1 = block.match(/QUESTION:\s+([\s\S]+?)\s+A\.\s+/);
    if (q1) {
      questionText = q1[1].replace(/\s+/g, ' ').trim();
    } else {
      const aIdx = block.search(/\sA\.\s+/);
      if (aIdx > 0) {
        const before = block.slice(0, aIdx);
        const lastMarks = [...before.matchAll(/Marks:\s*\d+/g)].pop();
        if (lastMarks) {
          let candidate = before.slice(lastMarks.index + lastMarks[0].length).trim();
          if (candidate.startsWith('·')) {
            candidate = candidate.slice(1).trim();
            const refPatterns = [
              /^Primary Stage \d+ [\w\s]+? [\w\d\.]+\s+(?=\S)/,
              /^Lower Sec [\w\s]+? Stage \d+ [\w\d\.]+\s+(?=\S)/,
              /^IGCSE [\w\s]+? \d+\s*\/\s*\d+ Topic \d+\s+(?=\S)/,
              /^[\w\s\/]+? Topic \d+\s+(?=\S)/,
              /^[\w\s]+? \d[A-Za-z]+\.?\d*\s+(?=\S)/,
              /^[\w\s\/]+?\s+(?=[A-Z])/,
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

    if (!questionText || questionText.length < 3) continue;

    questions.push({
      question_number: qNum,
      question_text: questionText,
      option_a: optA[1].replace(/\s+/g, ' ').trim(),
      option_b: optB[1].replace(/\s+/g, ' ').trim(),
      option_c: optC[1].replace(/\s+/g, ' ').trim(),
      option_d: optD[1].replace(/\s+/g, ' ').trim(),
      correct_answer: correctMatch[1],
      explanation,
      difficulty,
    });
  }
  return questions;
}

(async () => {
  const allPdfs = [];
  for (const sub of SUBJECT_DIRS) {
    const dir = path.join(ROOT, sub);
    if (fs.existsSync(dir)) allPdfs.push(...walkPdfs(dir));
  }
  console.log(`Found ${allPdfs.length} PDFs total\n`);

  // Group by subject-grade
  const groups = new Map();
  const skipped = [];

  for (const pdfPath of allPdfs) {
    const meta = deriveMetadata(pdfPath);
    if (!meta) {
      skipped.push(`No metadata: ${path.relative(ROOT, pdfPath)}`);
      continue;
    }
    try {
      const questions = await parsePdf(pdfPath);
      if (questions.length === 0) {
        skipped.push(`0 questions: ${path.relative(ROOT, pdfPath)}`);
        continue;
      }
      const key = `${meta.subject}-grade-${meta.grade}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ meta, questions });
      console.log(`  ${meta.subject} G${meta.grade} • Topic ${meta.topicNumber} ${meta.topic} → ${questions.length} questions`);
    } catch (err) {
      skipped.push(`Error: ${path.relative(ROOT, pdfPath)} — ${err.message}`);
    }
  }

  // Write one SQL file per subject-grade
  let totalRows = 0;
  for (const [key, items] of groups) {
    const lines = [
      `-- ${key.replace('-', ' ').replace('-', ' ')}`,
      `-- Generated by extract-all.cjs — paste this into Supabase SQL Editor`,
      '',
      'INSERT INTO public.questions (grade, subject, topic, topic_slug, topic_number, game_number, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, source_pdf) VALUES',
    ];
    const rows = [];
    for (const { meta, questions } of items) {
      for (const q of questions) {
        const gameNumber = Math.ceil(q.question_number / 10);
        rows.push(`  (${meta.grade}, '${esc(meta.subject)}', '${esc(meta.topic)}', '${esc(meta.topicSlug)}', ${meta.topicNumber ?? 'NULL'}, ${gameNumber}, ${q.question_number}, '${esc(q.question_text)}', '${esc(q.option_a)}', '${esc(q.option_b)}', '${esc(q.option_c)}', '${esc(q.option_d)}', '${q.correct_answer}', ${q.explanation ? `'${esc(q.explanation)}'` : 'NULL'}, '${q.difficulty}', '${esc(path.basename(meta.pdfPath))}')`);
      }
    }
    lines.push(rows.join(',\n'));
    lines.push('ON CONFLICT (grade, subject, topic_slug, question_number) DO NOTHING;');

    const outPath = path.join(OUT_DIR, `${key}.sql`);
    fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
    const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`\nWrote ${key}.sql — ${rows.length} questions (${sizeKB} KB)`);
    totalRows += rows.length;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL QUESTIONS EXTRACTED: ${totalRows}`);
  console.log(`OUTPUT FILES: ${groups.size} (in scripts/output/by-subject/)`);
  if (skipped.length > 0) {
    console.log(`\nSKIPPED PDFs (${skipped.length}):`);
    skipped.forEach((s) => console.log(`  - ${s}`));
  }
})();
