# MASTER_CONTEXT.md — AI News Bias & Transparency Platform

> This is the single source of truth for the project. Every agent, teammate, or
> tool working on this codebase should read this file first. It condenses the
> full hackathon plan into one reference. Deeper detail on each subsystem lives
> in its own file (see the file map at the bottom).

---

## 1. What We're Building

**Product:** An AI-powered platform that shows readers how different news
outlets cover the same story — side by side, with explainable bias analysis,
missing-perspective detection, and a timeline of how framing shifts over time.

**Core question the product answers:** *"How do different outlets cover the
same story, what framing do they use, and what perspectives are missing?"*

**Demo north star:** User searches a topic → platform shows a story cluster
pulled from 5+ outlets → one screen reveals a balanced summary, a
side-by-side comparison, explainable bias highlights, missing perspectives,
and a timeline.

**Constraint:** This is a 36-hour hackathon build for a team of 3. Everything
in this plan is scoped, sequenced, and budgeted against that constraint —
free-tier APIs, a hard hour-by-hour schedule, and a seed-data fallback so the
demo never depends on a live API call succeeding on stage.

---

## 2. Team & Roles

| Role | Owner | Primary deliverables |
|---|---|---|
| Backend + Ingestion | Member A | FastAPI, NewsAPI/RSS ingestion, DB, clustering, cron/background jobs |
| AI Pipeline | Member B | LLM prompts, bias/framing analysis, comparison, missing-perspective logic |
| Frontend + Demo | Member C | Next.js UI, Supabase Auth UI, visualizations, pitch deck, deployment |

Hours 20–34 are explicit overlap/integration time for all three.

---

## 3. Tech Stack (free-tier first, chosen for hackathon speed)

**Backend**
- FastAPI, Python 3.11+
- Supabase (Postgres, Auth, optional Storage) — single source of truth
- `supabase-py` for backend DB access via service-role key
- JWT validation via `python-jose` / Supabase JWT secret
- Supabase tables double as the cache layer — no paid Redis needed

**Auth**
- Supabase Auth — email/password + Google OAuth
- `@supabase/supabase-js` + `@supabase/ssr` for Next.js session handling
- Row Level Security (RLS) — users only read/write their own rows

**AI / ML**
- Google Gemini 2.0 Flash (primary) — free tier: 15 RPM / 1M tokens/day
- Groq (fallback) — free tier, Llama 3.x
- `sentence-transformers/all-MiniLM-L6-v2` (local, CPU) — zero-cost embeddings
- Structured JSON output via response schema, validated with Pydantic

**News Data**
- RSS feeds (primary, unlimited) — ~10 feeds across the political spectrum
- NewsAPI.org (secondary, budget-capped at 8 req/day, free tier allows 100)
- Pre-seeded demo dataset — 2–3 fully analyzed stories, zero-API demo path

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts or vis-timeline for bias spectrum + timeline charts

**Deploy**
- Backend: Railway or Render (free tier)
- Frontend: Vercel (hobby tier)
- DB/Auth/Cache: Supabase (free tier — 500 MB DB, 50k MAU)

Full rationale for each of these choices is in `DECISIONS.md`.

---

## 4. Architecture at a Glance

Four layers, cache-first, optimized for free-tier APIs:

```
Presentation (Next.js + Supabase Auth UI)
      ↓
API Layer (FastAPI Gateway + JWT middleware + REST routers)
      ↓
Domain Layer (Ingestion, Clustering, AI Analysis, Quota, User modules)
      ↓
Data Layer (Supabase Auth, Supabase Postgres, RSS, NewsAPI, Gemini/Groq, local embeddings)
```

**Golden rule:** the presentation layer never calls external APIs directly —
only FastAPI and Supabase Auth. All reads hit the DB cache first; writes go
through the service role. `API_MODE` is checked before every external call.

Full diagrams, module map, and data-flow sequences are in `ARCHITECTURE.md`.

---

## 5. The 12 Modules (M1–M12)

| ID | Module | Owner | Priority |
|---|---|---|---|
| M1 | Database & Migrations | A | P0 |
| M2 | Ingestion | A | P0 |
| M3 | API Gateway | A | P0 |
| M4 | Clustering | A | P0 |
| M5 | Embeddings (local) | A | P0 |
| M6 | AI Analysis Pipeline | B | P0 |
| M7 | Quota & API Mode | A | P0 |
| M8 | User Auth (backend) | A | P0 |
| M9 | Frontend Shell | C | P0 |
| M10 | Story Dashboard | C | P0 |
| M11 | Auth Pages (frontend) | C | P0 |
| M12 | Saved Stories UI | C | P1 |

Build order: `M1 → M7 → M2 → M5 → M4 → M6 → M3`, in parallel `M1 → M8 → M3`,
then `M3 → M9 → M10 → M12`. Full specs (inputs/outputs/interfaces/deliverables)
per module are in `ARCHITECTURE.md`.

---

## 6. The Non-Negotiable Rules

These override convenience every time. Full list with rationale in
`PROJECT_RULES.md`. The short version:

1. `API_MODE=seed` by default. Nothing burns a real API call unless someone
   explicitly flips the flag.
2. RSS is the primary ingestion source and is unlimited. NewsAPI is capped
   at 8 req/day (free tier allows 100 — we self-limit for safety margin).
3. One combined LLM call per story (not four). Max 20 Gemini analyses/day,
   max 10 Groq fallback calls/day.
4. Never re-analyze a story if `story_analysis` already has a row for it and
   the article set hasn't changed.
5. Local embeddings only (`sentence-transformers`, CPU) — zero embedding API
   calls, ever.
6. Modules talk to each other only through DB tables, REST endpoints, or
   `services/` functions — no cross-module file imports.
7. `SUPABASE_SERVICE_ROLE_KEY` never reaches the client. Anon key only in
   Next.js; service role only in FastAPI.
8. Demo and rehearsals always run in `API_MODE=seed` — zero live API
   dependency on demo day.

---

## 7. Data Flows (the four that matter)

**Flow 1 — View a story (hot path, zero API cost)**
```
Browser → GET /api/stories/{id} → story_analysis cache hit → JSON → render tabs
```

**Flow 2 — Background ingest (scheduled, RSS-only by default)**
```
Cron/BackgroundTask → quota_manager.can_call() → RSS fetch → normalize → dedup
→ insert articles → embed() → cluster → if new story AND quota OK → analyze()
```

**Flow 3 — Save a story (auth-gated)**
```
Browser → Supabase session JWT → POST /api/saved-stories → verify JWT
→ insert saved_stories (RLS)
```

**Flow 4 — Demo / seed mode (no external calls)**
```
Browser → GET /api/stories → quota_manager reads demo_stories.json or
Supabase seed rows → response
```

---

## 8. The 36-Hour Plan (phase overview)

| Phase | Hours | Goal | Gate |
|---|---|---|---|
| P0 Pre-work | Before H0 | Keys, seed data, repo | Supabase live; seed.sql ready |
| P1 Foundation | H0–6 | M1, M7, M3 skeleton | `API_MODE=seed` returns JSON |
| P2 Data pipeline | H6–14 | M2, M5, M4 | Stories in DB from RSS or seed |
| P3 AI pipeline | H8–18 | M6 | 1 story fully analyzed + cached |
| P4 Frontend core | H10–22 | M9, M10, M11 | Dashboard 5 tabs with seed data |
| P5 Integration | H22–30 | M8, M12, wire-up | Auth + save + deploy URLs live |
| P6 Demo polish | H30–36 | Pitch, rehearse | 3-min demo passes checklist |

Hour-by-hour task ownership and commit checkpoints live in `TASKS.md`.

---

## 9. Database (summary)

Core tables: `sources`, `articles` (with `vector(384)` embedding), `stories`,
`story_articles`, `story_analysis` (jsonb per analysis field), `profiles`
(linked to `auth.users`), `saved_stories`, `api_usage`, `api_cache`.

RLS: `profiles` and `saved_stories` are user-scoped (`auth.uid() = id` /
`auth.uid() = user_id`); `stories`/`articles`/`story_analysis` are public
read, service-role write only. Full schema and trigger SQL in `DATABASE.md`.

---

## 10. API Surface (summary)

11 REST endpoints under `/api/*` — story search/detail/compare/timeline
(mostly public), user profile and saved-stories (JWT-required), a manual
ingest trigger (JWT-required, quota-aware), a public quota status endpoint,
and a health check. Full request/response contract in `API.md`.

---

## 11. AI Pipeline (summary)

One orchestrator function, `analyze_story(story_id)`: check cache → check
quota → pull linked articles → single combined Gemini prompt → validate with
Pydantic → store full `story_analysis` JSON → return. The combined prompt
replaces four separate LLM calls and returns `balanced_summary`,
`comparison`, `bias_analysis`, `missing_perspectives`, and `timeline` in one
JSON payload. Full prompt design and schema in `AI_PROMPTS.md`.

---

## 12. Frontend (summary)

Nine pages: login, signup, auth callback, home/search, story dashboard
(5 tabs: Summary, Compare, Bias, Perspectives, Timeline), and saved stories.
Demo stays fully public — no forced login; auth is demonstrated mid-demo by
saving a story. Full page list, component list, and UX polish notes in
`UI_GUIDELINES.md`.

---

## 13. Demo (summary)

Three-minute script: hook (0:00–0:30) → search + open story (0:30–1:00) →
balanced summary (1:00–1:45) → bias + missing perspectives (1:45–2:30) →
timeline (2:30–3:00). Success criteria, innovation angles for judges, and
the rollback strategy if the team falls behind schedule are in
`DEMO_PLAN.md`.

---

## 14. Risk Mitigation (top risks)

| Risk | Mitigation |
|---|---|
| NewsAPI rate limits | RSS primary; hard cap 8/day; 6h cache; seed mode for dev |
| Gemini quota exhausted | Single combined prompt; max 20/day; cached fallback; Groq fallback |
| LLM latency (15–30s) | Pre-analyze demo stories; all reads from Supabase cache |
| Accidental API burn during dev | `API_MODE=seed` default; quota manager blocks calls |
| Clustering fails | Manual `story_id` assignment for demo topics |
| Team integration delays | Agree OpenAPI spec by Hour 6; seed JSON until Hour 20 |

Full risk table in `PROJECT_RULES.md`.

---

## 15. File Map

| File | Contents |
|---|---|
| `MASTER_CONTEXT.md` | This file — condensed overview of everything |
| `PROJECT_RULES.md` | Non-negotiable constraints, env vars, coding contract, security rules |
| `TASKS.md` | Hour-by-hour task breakdown, owners, gates, commit checkpoints |
| `ARCHITECTURE.md` | Layered architecture, module specs, data flows, deployment topology |
| `DATABASE.md` | Full schema SQL, RLS policies, triggers, indexing notes |
| `API.md` | Full REST endpoint contract |
| `AI_PROMPTS.md` | Combined analysis prompt, JSON schema, budget math, prompt tips |
| `UI_GUIDELINES.md` | Page list, component list, tech choices, UX polish |
| `DEMO_PLAN.md` | Demo script, success criteria, innovation angles, rollback strategy |
| `DECISIONS.md` | Key technical decisions and why we made them |
| `README.md` | Entry point — how to set up and run the project |

---

## 16. Definition of Done (for the whole hackathon)

- [ ] 5+ sources clustered into 1 story
- [ ] Balanced summary with consensus vs. dispute sections
- [ ] Side-by-side comparison of ≥3 articles
- [ ] ≥3 explainable bias highlights with quoted text
- [ ] Missing perspectives list (≥2 items)
- [ ] Timeline with ≥4 chronological entries
- [ ] Deployed URL + 3-min live demo without manual backend steps
- [ ] User can sign up/login (email or Google) and save a story to `/saved`
- [ ] Entire demo runnable with `API_MODE=seed` (zero live API calls)
- [ ] Quota manager prevents exceeding free-tier limits; UI shows remaining budget
