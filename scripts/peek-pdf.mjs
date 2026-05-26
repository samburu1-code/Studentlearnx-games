// Quick PDF text extractor — reads a PDF and prints first ~3000 chars
import pdfParse from 'pdf-parse';
import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node peek-pdf.mjs <path-to-pdf>');
  process.exit(1);
}

const buf = fs.readFileSync(file);
const data = await pdfParse(buf);

console.log(`PAGES: ${data.numpages}`);
console.log(`TOTAL CHARS: ${data.text.length}`);
console.log('---');
console.log(data.text.slice(0, 5000));
console.log('--- (truncated if longer) ---');
