# PROJECT_RULES.md — Non-Negotiable Constraints

> Read this before writing any code. These rules exist to protect the team's
> free-tier API budget and to guarantee the demo works even if every live API
> is down, rate-limited, or slow. When in doubt, follow the rule — don't
> optimize it away for "just this once."

---

## 1. API Mode Discipline

Three modes, controlled by the `API_MODE` env var:

```
seed   → Demo/rehearsal: zero external API calls, serve pre-baked JSON
rss    → Development default: RSS ingest + local embeddings only; no
         NewsAPI, no new LLM calls
live   → Production demo: RSS + capped NewsAPI + capped LLM; auto-downgrade
         to rss when quota hit
```

**Rules:**
- `API_MODE=seed` is the default in every `.env` file from Hour 0.
- Nobody switches to `live` without saying so out loud to the team first.
- `quota_manager.py` must be implemented and wired in *before* any module
  makes its first live external call.
- Development workflow across the 36 hours:
  1. Hours 0–20: `API_MODE=seed`
  2. Hours 14–18: one-time `live` run to ingest + analyze 3 demo topics,
     persisted to Supabase
  3. Hours 20–34: `API_MODE=rss` for integration testing (RSS only, no LLM)
  4. Hour 35 demo: `seed` or `live` depending on whether fresh data is needed
  5. Never re-run `analyze_story()` on a `story_id` that already has a
     `story_analysis` row (unless the article set changed)

---

## 2. Free-Tier Budget Caps (hard limits, not targets)

| Service | Free tier limit | Our daily budget | Fallback when exhausted |
|---|---|---|---|
| RSS feeds | Unlimited | Primary source | — |
| NewsAPI | 100 req/day (dev) | **Max 8 req/day** | RSS-only mode |
| Gemini Flash | ~1M tokens/day, 15 RPM | **Max 20 story analyses/day** | Serve cached `story_analysis` |
| Groq | Rate-limited free | **Max 10 fallback calls/day** | Return pre-seeded analysis |
| Supabase | 500 MB, 50k MAU | Stay under 200 MB | — |
| Local embeddings | Unlimited (CPU) | Unlimited | — |
| Vercel / Railway | Hobby free limits | 1 deploy each | — |

Enforcement mechanics: increment the counter **before** the call, abort if
`calls_today >= budget`. Reset counters at UTC midnight (cron or lazy reset
on first call of the day). Log every blocked call, e.g. `"NewsAPI budget
exhausted, falling back to RSS"`.

---

## 3. LLM Cost Discipline

- **One combined prompt per story.** Never split analysis into four separate
  LLM calls — this is the single biggest quota-burn risk.
- Cap input: truncate each article to its first 600 tokens (5 articles ×
  600 ≈ 3,000 input tokens).
- Force structured JSON output; validate every response with Pydantic before
  writing to the DB.
- Include exactly 1 few-shot example in the prompt — don't bloat context.
- Test prompts against seed data locally before burning real Gemini quota.
- Budget math: 20 stories × 1 call = 20 Gemini calls/day, comfortably under
  the free tier. Pre-analyze 3 demo stories once, cache forever for
  rehearsals.

---

## 4. Ingestion Discipline

- RSS is primary and unlimited — poll every 30 minutes (48 runs/day, zero
  API cost).
- NewsAPI is secondary: 1 call per scheduled ingest batch max, only to fill
  gaps RSS missed. Skip if the same query was fetched in the last 6 hours
  (check `api_cache` first).
- **Never call NewsAPI from the frontend.** Backend only, quota-guarded.
- URL-dedup every article before insert.

---

## 5. Module Boundaries

- Modules communicate **only** via defined interfaces: DB tables, REST
  endpoints, or `services/` and `routers/` Python functions.
- No cross-module file imports outside those paths.
- Each module (M1–M12) has one owner and a single deliverable — don't blur
  scope across modules mid-build; if you need something from another
  module's territory, use its published interface.

---

## 6. Security Rules

- `SUPABASE_SERVICE_ROLE_KEY` lives in the backend `.env` only. It must
  never be sent to, embedded in, or logged by the frontend.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the only Supabase key the frontend ever
  holds.
- All writes to `stories`, `articles`, and `story_analysis` go through the
  service role (backend ingestion/AI pipeline) — never directly from the
  client.
- RLS is mandatory on `profiles` and `saved_stories`: users can only
  read/write their own rows (`auth.uid() = id` / `auth.uid() = user_id`).
- FastAPI verifies the Supabase JWT (via `SUPABASE_JWT_SECRET`) on every
  protected route — never trust a client-supplied user ID.

---

## 7. Environment Variables

```
# Backend (.env)
API_MODE=seed
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=      # ingestion + AI pipeline only — never expose to client
SUPABASE_JWT_SECRET=            # verify user tokens in FastAPI
GEMINI_API_KEY=
GROQ_API_KEY=
NEWSAPI_KEY=

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 8. Caching Rules

| Table | Purpose | TTL |
|---|---|---|
| `story_analysis` | Full AI output per story | Permanent until articles change |
| `api_cache` | Raw NewsAPI/RSS fetch results | 6h for NewsAPI, 30min for RSS |
| `api_usage` | Daily quota counters | Reset daily |
| `articles.embedding` | Local embedding vectors | Permanent |

**Cache-first rule:** every API handler checks `story_analysis` before
triggering an LLM call. The frontend search reads the DB only — it never
triggers ingestion on page load.

---

## 9. Coding Contract

- Agree on the OpenAPI response shapes as a team by Hour 6 — don't let
  frontend and backend drift on payload shape past that point.
- Frontend builds against mock/seed JSON first, then wires to the live API —
  never block frontend progress on backend completion.
- Commit per module/phase with descriptive messages (see `TASKS.md` for the
  expected commit points).

---

## 10. Rollback Strategy (if behind schedule at Hour 18)

Cut scope in this order — do not cut out of order:

1. Drop NewsAPI entirely → RSS + seed only
2. Drop `/saved` page → save button shows a toast only, no persistence
3. Drop the timeline chart → list-only timeline
4. Drop live mode entirely → seed-only demo (`API_MODE` always `seed`)

**Never cut:** the M6 analysis output, the M10 Bias tab with loaded phrases,
or the M3 seed API. These are the demo's core value proposition.

---

## 11. Risk Register

| Risk | Mitigation |
|---|---|
| NewsAPI rate limits (100/day) | RSS primary; hard cap 8/day; 6h cache; `API_MODE=seed` for dev |
| Gemini quota exhausted | Single combined prompt; max 20/day; serve cached `story_analysis`; Groq fallback |
| LLM latency (15–30s) | Pre-analyze demo stories; all reads from Supabase cache |
| Accidental API burn during dev | `API_MODE=seed` default; quota manager blocks calls; never analyze same story twice |
| Clustering fails | Manual `story_id` assignment for demo topics |
| Scraping blocked | RSS + NewsAPI `description` field only; no HTML scraping |
| Team integration delays | Agree on OpenAPI spec by Hour 6; seed JSON until Hour 20 |
| Supabase Auth redirect mismatch | Set localhost + Vercel callback URLs in Supabase dashboard early |
| RLS blocks backend writes | Service role key in FastAPI for ingestion; anon key only in Next.js |
| Supabase 500 MB limit | Store embeddings as `vector(384)`; truncate article content to 2k chars; no raw API dumps |
