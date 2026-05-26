// Quick PDF text extractor using pdfjs-dist
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node peek-pdf.cjs <path-to-pdf>');
  process.exit(1);
}

(async () => {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(file));
  const loadingTask = pdfjsLib.getDocument({ data, disableFontFace: true });
  const pdf = await loadingTask.promise;
  console.log(`PAGES: ${pdf.numPages}`);
  console.log('---');
  let all = '';
  const maxPages = Math.min(10, pdf.numPages);
  for (let p = 1; p <= maxPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const txt = tc.items.map((it) => it.str).join(' ');
    all += `\n===PAGE ${p}===\n${txt}\n`;
  }
  console.log(all.slice(0, 8000));
  console.log('--- (truncated if longer) ---');
})();
