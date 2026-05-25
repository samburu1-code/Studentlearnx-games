# Deployment Guide — StudentLearnX Games

This guide walks you through deploying the games app to `games.studentlearnx.com`.

**Total time:** ~30 minutes
**Cost:** Free (Vercel Hobby + Supabase Free tiers)

---

## Overview

You'll set up three things, in this order:

1. **Supabase project** — your cloud database (where student accounts and scores live)
2. **GitHub repository** — where your code lives so Vercel can deploy it
3. **Vercel project** — hosts the live site and connects to your custom domain

---

## Step 1 — Create Your Supabase Project (10 min)

1. Go to [supabase.com](https://supabase.com) and click **Start your project**
2. Sign in with GitHub (recommended) or email
3. Click **New Project**
   - **Name:** `studentlearnx-games`
   - **Database password:** generate a strong one and **save it** somewhere safe
   - **Region:** pick closest to your students (e.g. South Asia / Europe West)
   - **Pricing plan:** Free
4. Wait ~2 minutes for the project to provision

### Run the database schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned" — this means the tables, RLS policies, and triggers were created

### Get your API keys

1. In Supabase, click **Project Settings** (gear icon) → **API**
2. Copy these two values (you'll paste them into Vercel later):
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public key** (a long string starting with `eyJ...`)

### Enable email confirmations (optional but recommended)

1. **Authentication** → **Providers** → **Email**
2. Toggle **Confirm email** on if you want students to verify their address
3. Or leave it off for instant signup (faster for testing)

---

## Step 2 — Push Code to GitHub (5 min)

If you don't have a GitHub account, create one at [github.com](https://github.com) first.

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `studentlearnx-games`
3. Set to **Private** (your code is not public)
4. **Do NOT** check "Initialize with README" (you already have files)
5. Click **Create repository**
6. GitHub will show you a page with commands. Copy the URL it gives you (looks like `https://github.com/YOUR-USERNAME/studentlearnx-games.git`)

Then in PowerShell, from the project folder, run:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/studentlearnx-games.git
git branch -M main
git push -u origin main
```

You should see your files appear in the GitHub repo.

---

## Step 3 — Deploy to Vercel (10 min)

1. Go to [vercel.com](https://vercel.com) and click **Sign Up**
2. Sign up with **GitHub** (this lets Vercel see your repos)
3. After signup, click **Add New** → **Project**
4. Find `studentlearnx-games` in your repo list and click **Import**
5. Vercel auto-detects Next.js — leave Framework Preset as is
6. **Important: add environment variables** before deploying
   - Expand the **Environment Variables** section
   - Add `NEXT_PUBLIC_SUPABASE_URL` → paste the Project URL from Supabase
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste the anon public key from Supabase
7. Click **Deploy**
8. Wait ~2 minutes — Vercel will give you a URL like `studentlearnx-games-abc123.vercel.app`
9. Open it and test signup + a game. If everything works, move to Step 4.

---

## Step 4 — Connect Your Custom Domain (5 min)

### In Vercel

1. Open your Vercel project → **Settings** → **Domains**
2. Type `games.studentlearnx.com` and click **Add**
3. Vercel shows you a DNS record to add. It will look like:
   ```
   Type:  CNAME
   Name:  games
   Value: cname.vercel-dns.com
   ```

### In your DNS provider (likely Cloudflare based on your current setup)

1. Log into Cloudflare and select `studentlearnx.com`
2. Click **DNS** in the left menu
3. Click **Add record**
   - **Type:** CNAME
   - **Name:** `games`
   - **Target:** `cname.vercel-dns.com`
   - **Proxy status:** **DNS only** (gray cloud, NOT orange) — important for Vercel to manage SSL
4. Click **Save**

DNS usually propagates in 1–5 minutes. Vercel will automatically detect it and issue an SSL certificate. Once green-checked in Vercel, visit `https://games.studentlearnx.com` — you should see your games app.

---

## Step 5 — Add a Link from Your Main Site

On your existing StudentLearnX.com Games page (or homepage), add a button/link:

```html
<a href="https://games.studentlearnx.com" target="_blank" rel="noopener">
  Play Quiz Games →
</a>
```

That's it. Students click, land on the games app, sign up, and start earning XP.

---

## Updating the Site Later

Every time you push code to GitHub `main` branch, Vercel automatically rebuilds and redeploys (~1 minute). No manual steps needed.

```powershell
git add .
git commit -m "Add Grade 11 chemistry questions"
git push
```

---

## Troubleshooting

**"Invalid email or password" on every login attempt**
→ Check that your two Supabase env vars in Vercel are correct (no extra spaces). Re-deploy after fixing.

**Vercel says "Environment Variable references Secret which does not exist"**
→ You added the env vars at the wrong level. Make sure they're set for **Production**, **Preview**, AND **Development** environments.

**Games show but signup fails**
→ The schema SQL didn't run successfully. Re-open Supabase SQL Editor and run `001_schema.sql` again.

**Custom domain stuck on "Invalid Configuration"**
→ In Cloudflare, make sure the proxy is set to **DNS only** (gray cloud), not Proxied (orange). Wait 5 minutes after fixing.

---

## What Each Service Costs

| Service | Free tier limit | When you'd need to upgrade |
|---------|----------------|---------------------------|
| Vercel  | 100 GB bandwidth/month, unlimited deploys | ~10,000+ daily students |
| Supabase | 500 MB DB, 50,000 monthly active users | Mass growth |
| Cloudflare DNS | Unlimited | Never |

For StudentLearnX's launch, free tiers will be more than enough for the first year.
