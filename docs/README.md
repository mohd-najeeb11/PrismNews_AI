# news-transparency

AI-powered news bias & transparency platform — 36-hour hackathon MVP.

Search a topic → see a story cluster from 5+ outlets → get a balanced
summary, a side-by-side comparison, explainable bias analysis, missing
perspectives, and a story evolution timeline.

---

## Project Docs

Read these in order — each builds on the last:

| Doc | What it covers |
|---|---|
| [`MASTER_CONTEXT.md`](./MASTER_CONTEXT.md) | Single condensed source of truth — read this first |
| [`PROJECT_RULES.md`](./PROJECT_RULES.md) | Non-negotiable constraints, budget caps, security, env vars |
| [`TASKS.md`](./TASKS.md) | Hour-by-hour task breakdown, owners, gates |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Layered architecture, module specs, data flows, deployment |
| [`DATABASE.md`](./DATABASE.md) | Full schema SQL, RLS policies, triggers |
| [`API.md`](./API.md) | REST endpoint contract |
| [`AI_PROMPTS.md`](./AI_PROMPTS.md) | Combined analysis prompt, JSON schema, quota budget |
| [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) | Pages, components, tech stack, UX polish |
| [`DEMO_PLAN.md`](./DEMO_PLAN.md) | 3-minute demo script, success criteria, judge Q&A prep |
| [`DECISIONS.md`](./DECISIONS.md) | Why we made the calls we made |

---

## Tech Stack

- **Backend:** FastAPI, Python 3.11, supabase-py, python-jose, feedparser,
  sentence-transformers, google-generativeai
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui,
  @supabase/ssr, Recharts
- **Database:** Supabase Postgres with pgvector, RLS policies
- **Auth:** Supabase Auth — email/password + Google OAuth
- **AI:** Gemini 2.0 Flash (primary), Groq (fallback)
- **News data:** RSS feeds (primary, unlimited), NewsAPI (secondary, capped)
- **Deploy:** Vercel (frontend), Railway or Render (backend), Supabase Cloud
  (DB + Auth)

Full rationale for each choice: [`DECISIONS.md`](./DECISIONS.md).

---

## Team

| Role | Owner | Deliverables |
|---|---|---|
| Backend + Ingestion | Member A | FastAPI, ingestion, DB, clustering, cron jobs |
| AI Pipeline | Member B | LLM prompts, bias/framing analysis, missing-perspective logic |
| Frontend + Demo | Member C | Next.js UI, Auth UI, visualizations, pitch deck, deployment |

---

## Environment Setup

```bash
# Backend (.env)
API_MODE=seed
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=      # backend only — never expose to client
SUPABASE_JWT_SECRET=
GEMINI_API_KEY=
GROQ_API_KEY=
NEWSAPI_KEY=

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`API_MODE=seed` is the required default — see `PROJECT_RULES.md` §1 before
changing it.

---

## Quick Start

```bash
# 1. Apply Supabase migrations (see DATABASE.md for schema)
supabase db push

# 2. Backend
cd backend
pip install -r requirements.txt --break-system-packages
uvicorn app.main:app --reload

# 3. Frontend
cd frontend
npm install
npm run dev
```

Verify: `curl localhost:8000/api/stories` should return seed stories with
`API_MODE=seed` and zero external API calls.

---

## Project Structure

```
news-transparency/
├── supabase/
│   ├── migrations/           # schema, RLS, triggers, pgvector
│   └── seed.sql              # demo stories
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── auth/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── models/
│   │   └── prompts/
│   ├── data/seed/
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── lib/supabase/
│   ├── middleware.ts
│   └── components/
└── README.md
```

Full breakdown: [`ARCHITECTURE.md`](./ARCHITECTURE.md) §9.

---

## Verification Checklist

- [ ] `API_MODE=seed` serves demo stories with zero external calls
- [ ] Story dashboard shows all 5 tabs with data
- [ ] Google OAuth login works
- [ ] Save story → appears on `/saved`
- [ ] `GET /api/quota` returns budget status
- [ ] Bias tab shows ≥3 highlighted loaded phrases with reasons

Full success criteria and demo script: [`DEMO_PLAN.md`](./DEMO_PLAN.md).
