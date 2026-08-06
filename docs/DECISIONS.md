# DECISIONS.md — Key Technical Decisions & Rationale

> A running log of the calls that shaped this architecture. If you're
> tempted to change one of these mid-build, read the rationale first — most
> of them exist specifically to survive a 36-hour clock and a $0 budget.

---

## D1 — Single combined LLM call instead of four separate calls

**Decision:** One `analyze_story()` prompt returns
`balanced_summary` + `comparison` + `bias_analysis` +
`missing_perspectives` + `timeline` in one JSON response.

**Why:** Four separate calls would burn 4x the Gemini quota for the same
number of stories analyzed, and 4x the latency per story. At 20
stories/day, that's the difference between a comfortable free-tier budget
and blowing through it by mid-afternoon on demo day.

---

## D2 — RSS as primary ingestion, NewsAPI capped and secondary

**Decision:** RSS polling every 30 minutes is the main article source.
NewsAPI is capped at 8 requests/day (well under its 100/day free-tier
limit) and only fills gaps RSS missed.

**Why:** RSS is unlimited and free forever. NewsAPI's free tier is
generous but finite, and burning it during development would leave nothing
for the actual demo. The self-imposed cap (8, not 100) leaves headroom for
mistakes.

---

## D3 — Local embeddings instead of an embeddings API

**Decision:** `sentence-transformers/all-MiniLM-L6-v2` runs on the backend
CPU for all clustering embeddings.

**Why:** Zero API cost, zero rate limit, zero network dependency for a
step that runs on every ingested article. This is the highest-frequency
external-facing operation in the pipeline, so it's the one most worth
moving off any paid or rate-limited service entirely.

---

## D4 — Supabase for Postgres + Auth + Cache (no Redis)

**Decision:** All caching (`story_analysis`, `api_cache`, `api_usage`)
lives in Supabase Postgres tables rather than a separate Redis instance.

**Why:** One fewer service to provision, configure, and pay for during a
36-hour build. Supabase's free tier (500 MB, 50k MAU) comfortably covers a
hackathon demo's data volume, and RLS gives us auth-scoped data access for
free that a bare Redis cache wouldn't.

---

## D5 — `API_MODE` three-state flag (`seed` / `rss` / `live`)

**Decision:** Every external-call path checks a single env var before
doing anything live, with `seed` as the universal default.

**Why:** This is the mechanism that makes "the demo never depends on a live
API call succeeding on stage" actually true, rather than aspirational. It
also lets frontend and backend development proceed in parallel without
either side burning quota just to test UI.

---

## D6 — Cache-first reads, quota-gated writes

**Decision:** Every read path checks `story_analysis` (or `api_cache`)
before ever considering a live call. Every write path that hits an
external API goes through `quota_manager.can_call()` first, with the
counter incremented *before* the call is made.

**Why:** Guarantees the hot path (a user viewing an already-analyzed story)
costs nothing, and guarantees a budget can never be silently exceeded by a
race condition between the check and the call.

---

## D7 — Never re-analyze an unchanged story

**Decision:** `analyze_story(story_id)` is a strict no-op if
`story_analysis.analyzed_at` already exists and the linked article set
hasn't changed.

**Why:** LLM analysis is the single most expensive and highest-latency
operation in the system. Re-running it on the same input is pure waste of
both quota and demo-day risk (a slow re-analysis mid-pitch is worse than no
analysis at all).

---

## D8 — Modules talk only through DB tables, REST endpoints, or `services/`

**Decision:** No cross-module file imports outside `services/` and
`routers/`.

**Why:** Three people are working in the same monorepo simultaneously under
extreme time pressure. Enforced interface boundaries are what let each
member ship independently and merge without stepping on each other's files.

---

## D9 — Service-role key never reaches the client

**Decision:** `SUPABASE_SERVICE_ROLE_KEY` lives only in the backend `.env`.
The frontend only ever holds `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Why:** This is the one security boundary that, if violated, undermines
every RLS policy in the schema — a leaked service-role key bypasses RLS
entirely. Non-negotiable regardless of time pressure.

---

## D10 — Demo stays fully public; auth demonstrated via Save

**Decision:** Browsing and viewing full analysis never requires login.
Auth is showcased specifically by saving a story mid-demo.

**Why:** A forced-login wall in front of a 3-minute judged demo is pure
friction with no upside — judges want to see the product, not create an
account. Saving a story is a natural, low-friction moment to prove auth
works without gating the core value proposition behind it.

---

## D11 — Quota status is a visible UI feature, not just a debug tool

**Decision:** `GET /api/quota` is public and rendered as a footer badge in
the live UI.

**Why:** Doubles as a judge-facing proof point: "we built this to survive
on a free tier sustainably," which is a real differentiator versus a demo
that would collapse the moment it left the hackathon's Wi-Fi.
