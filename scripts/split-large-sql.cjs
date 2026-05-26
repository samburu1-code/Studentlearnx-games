/**
 * Splits any SQL file > 400 KB into smaller per-topic chunks
 * so each fits comfortably in the Supabase SQL Editor.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'output', 'by-subject');
const DST_DIR = path.join(__dirname, 'output', 'ready-to-paste');
const MAX_SIZE = 400 * 1024;

if (!fs.existsSync(DST_DIR)) fs.mkdirSync(DST_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.sql'));

for (const file of files) {
  const srcPath = path.join(SRC_DIR, file);
  const size = fs.statSync(srcPath).size;
  const baseName = file.replace('.sql', '');

  if (size <= MAX_SIZE) {
    fs.copyFileSync(srcPath, path.join(DST_DIR, file));
    console.log(`  ${file} (${(size / 1024).toFixed(0)} KB) — copied as-is`);
    continue;
  }

  // Need to split. Read & parse rows.
  const content = fs.readFileSync(srcPath, 'utf8');
  const lines = content.split('\n');

  // Find INSERT header + ON CONFLICT trailer
  const insertIdx = lines.findIndex((l) => l.startsWith('INSERT INTO'));
  const conflictIdx = lines.findIndex((l) => l.startsWith('ON CONFLICT'));
  if (insertIdx < 0 || conflictIdx < 0) continue;

  const header = lines.slice(0, insertIdx + 1).join('\n');
  const trailer = lines.slice(conflictIdx).join('\n');
  const rowLines = lines.slice(insertIdx + 1, conflictIdx).filter((l) => l.trim().length > 0);

  // Group rows by topic_slug (3rd-ish field, but easier: parse position 3 in the values)
  const byTopic = new Map();
  for (const row of rowLines) {
    const slugMatch = row.match(/,\s*'([^']+)',\s*\d+\s*,\s*\d+\s*,/);
    const slug = slugMatch ? slugMatch[1] : 'misc';
    if (!byTopic.has(slug)) byTopic.set(slug, []);
    byTopic.get(slug).push(row.replace(/,\s*$/, ''));
  }

  let partIdx = 1;
  let buf = [];
  let bufSize = 0;
  const flush = () => {
    if (buf.length === 0) return;
    const outName = `${baseName}-part${partIdx}.sql`;
    const body = header + '\n' + buf.join(',\n') + '\n' + trailer;
    fs.writeFileSync(path.join(DST_DIR, outName), body, 'utf8');
    console.log(`  ${outName} — ${buf.length} rows (${(body.length / 1024).toFixed(0)} KB)`);
    partIdx++;
    buf = [];
    bufSize = 0;
  };

  for (const [, rows] of byTopic) {
    for (const r of rows) {
      const rowSize = r.length + 2;
      if (bufSize + rowSize > MAX_SIZE - 2000 && buf.length > 0) flush();
      buf.push(r);
      bufSize += rowSize;
    }
  }
  flush();
}

console.log(`\nDone. Output in: ${DST_DIR}`);
