# StudentLearnX Games

Quiz game platform for StudentLearnX.com — quiz games for Grades 1–12 across Physics, Chemistry, Biology, English, and Math.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, and Supabase.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **State:** Zustand (with localStorage persistence)
- **Animations:** Framer Motion
- **Backend:** Supabase (Postgres + Auth + Row Level Security)
- **Hosting:** Vercel (recommended)

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # then fill in Supabase values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                  Routes (App Router)
  games/              Quiz games (grade → subject → topic → game)
  auth/               Login / signup pages
  api/                API routes (game-sessions, progress)
  profile/            Student dashboard
components/           React components
  game/               Quiz game UI (QuizGame, AnswerButton, ScoreScreen)
  layout/             Header, Footer
data/                 Question JSON files (organized by grade/subject)
hooks/                Zustand stores + auth hook
lib/                  Scoring logic, Supabase clients
supabase/migrations/  Database schema SQL
types/                Shared TypeScript types
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full guide to deploy to Vercel + Supabase and connect `games.studentlearnx.com`.

## Adding More Question Content

Each topic is one JSON file under `data/grade-{N}/{subject}/topic-{N}-{slug}.json`. See existing files for the format. Topic & game routing is automatic — just drop in a new JSON file and add the topic to the manifest in `app/games/[grade]/[subject]/page.tsx`.
