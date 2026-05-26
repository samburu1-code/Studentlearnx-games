#!/usr/bin/env node
/**
 * StudentLearnX — PDF Question Extractor
 *
 * Sends a PDF to the Claude API, gets back structured questions, imports to Supabase.
 *
 * Usage:
 *   node scripts/extract-pdf.mjs <path-to-pdf> --grade 12 --subject Physics --topic "Kinematics" --topic-slug kinematics --topic-number 2 [--dry-run]
 *
 * Required env vars (.env.local):
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... (NOT the publishable key — get the service_role key)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);
const pdfPath = args[0];

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
}

const grade = parseInt(getArg('--grade'), 10);
const subject = getArg('--subject');
const topic = getArg('--topic');
const topicSlug = getArg('--topic-slug');
const topicNumber = getArg('--topic-number') ? parseInt(getArg('--topic-number'), 10) : null;
const dryRun = args.includes('--dry-run');

if (!pdfPath || !grade || !subject || !topic || !topicSlug) {
  console.error('Missing required arguments.');
  console.error('Usage: node scripts/extract-pdf.mjs <pdf> --grade N --subject X --topic "Name" --topic-slug name [--topic-number N] [--dry-run]');
  process.exit(1);
}

const anthropicKey = process.env.ANTHROPIC_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!anthropicKey) { console.error('ANTHROPIC_API_KEY not set in .env.local'); process.exit(1); }
if (!dryRun && (!supabaseUrl || !supabaseServiceKey)) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required (or use --dry-run)');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: anthropicKey });

console.log(`\nExtracting: ${path.basename(pdfPath)}`);
console.log(`  Grade ${grade} · ${subject} · ${topic} (slug: ${topicSlug})\n`);

const pdfBuffer = await fs.readFile(pdfPath);
const pdfBase64 = pdfBuffer.toString('base64');

const systemPrompt = `You extract multiple-choice questions from educational PDFs.

Return a JSON array of questions in this exact shape:
[
  {
    "question_text": "string (use $...$ for inline math like $v=u+at$)",
    "option_a": "string",
    "option_b": "string",
    "option_c": "string",
    "option_d": "string",
    "correct_answer": "A" | "B" | "C" | "D",
    "explanation": "string or null",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Rules:
- Extract EVERY multiple-choice question you find
- If a question has fewer than 4 options, fill missing ones with plausible distractors
- If the correct answer isn't marked, use your best guess from physics/math/science principles
- Wrap all math expressions in $ delimiters (LaTeX inline math)
- Skip questions that require diagrams you cannot describe in text
- Output ONLY the JSON array — no prose, no markdown fences`;

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 16000,
  system: systemPrompt,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
        },
        {
          type: 'text',
          text: `Extract all multiple-choice questions from this Grade ${grade} ${subject} PDF on "${topic}". Return JSON only.`,
        },
      ],
    },
  ],
});

const text = response.content[0].type === 'text' ? response.content[0].text : '';
const jsonMatch = text.match(/\[[\s\S]*\]/);
if (!jsonMatch) {
  console.error('No JSON array found in response. Raw output:\n', text.slice(0, 500));
  process.exit(1);
}

let questions;
try {
  questions = JSON.parse(jsonMatch[0]);
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  console.error('First 500 chars:', jsonMatch[0].slice(0, 500));
  process.exit(1);
}

console.log(`Extracted ${questions.length} questions.`);
console.log(`Tokens used: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`);
const cost = (response.usage.input_tokens * 3 + response.usage.output_tokens * 15) / 1_000_000;
console.log(`Estimated cost: $${cost.toFixed(4)}\n`);

const rows = questions.map((q, i) => ({
  grade,
  subject,
  topic,
  topic_slug: topicSlug,
  topic_number: topicNumber,
  game_number: Math.floor(i / 10) + 1,
  question_number: i + 1,
  question_text: q.question_text,
  option_a: q.option_a,
  option_b: q.option_b,
  option_c: q.option_c,
  option_d: q.option_d,
  correct_answer: q.correct_answer,
  explanation: q.explanation,
  difficulty: q.difficulty || 'medium',
  source_pdf: path.basename(pdfPath),
}));

if (dryRun) {
  const outFile = `extracted-${topicSlug}.json`;
  await fs.writeFile(outFile, JSON.stringify(rows, null, 2));
  console.log(`Dry run — wrote ${rows.length} questions to ${outFile}`);
  console.log('Review the file, then re-run without --dry-run to import to Supabase.');
} else {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { error } = await supabase.from('questions').upsert(rows, {
    onConflict: 'grade,subject,topic_slug,question_number',
  });
  if (error) {
    console.error('Supabase insert failed:', error.message);
    process.exit(1);
  }
  console.log(`Imported ${rows.length} questions into Supabase.`);
  console.log(`That's ${Math.ceil(rows.length / 10)} playable games for ${subject} Grade ${grade} - ${topic}.`);
}
