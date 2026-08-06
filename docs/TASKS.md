# TASKS.md — Hour-by-Hour Execution Plan

> 36 hours, team of 3. Each phase has a gate that must pass before the next
> phase starts, and parallel tracks per teammate. Check off tasks as you go.

---

## Phase Overview

| Phase | Hours | Goal | Gate criteria |
|---|---|---|---|
| P0 Pre-work | Before H0 | Keys, seed data, repo | Supabase live; seed.sql ready |
| P1 Foundation | H0–6 | M1, M7, M3 skeleton | `API_MODE=seed` returns JSON |
| P2 Data pipeline | H6–14 | M2, M5, M4 | Stories in DB from RSS or seed |
| P3 AI pipeline | H8–18 | M6 | 1 story fully analyzed + cached |
| P4 Frontend core | H10–22 | M9, M10, M11 | Dashboard 5 tabs with seed data |
| P5 Integration | H22–30 | M8, M12, wire-up | Auth + save + deploy URLs live |
| P6 Demo polish | H30–36 | Pitch, rehearse | 3-min demo passes checklist |

---

## P0 — Pre-work (before Hour 0, ~2 hours)

- [ ] Create Supabase project + enable Google OAuth — **Owner: A** — Output: project URL + keys
- [ ] Run offline seed script (RSS + 1 Gemini call × 3 topics) — **Owner: B** — Output: `seed.sql`, `demo_stories.json`
- [ ] Create GitHub repo + share `.env.example` — **Owner: C** — Output: empty monorepo
- [ ] Agree OpenAPI response shapes (30 min call) — **All**

**Gate:** all keys in password manager; seed files committed.

---

## P1 — Foundation (Hours 0–6)

- [x] Backend Foundation Setup (FastAPI, venv, requirements, config, logging, CORS, API v1 routing, health check) — **Completed**

| Hour | Member A | Member B | Member C | Modules |
|---|---|---|---|---|
| 0–2 | M1: migrations + apply to Supabase | M6: draft combined_analysis prompt + Pydantic models | M9: Next.js + Tailwind + shadcn scaffold | M1, M6, M9 |
| 2–4 | M7: quota_manager + seed loader | M6: test prompt against 1 seed article (offline paste) | M10: story page layout + tab shell (mock JSON) | M7, M6, M10 |
| 4–6 | M3: FastAPI skeleton + `/api/stories` seed route | M6: finalize JSON schema | M11: Supabase client + login page stub | M3, M11 |

**Gate:** `curl localhost:8000/api/stories` returns seed stories; frontend
tabs render mock data.

**Commit:** `feat(M1,M7,M3): database, quota manager, seed API`


---

## P2 — Data Pipeline (Hours 6–14)

| Hour | Member A | Member B | Member C | Modules |
|---|---|---|---|---|
| 6–9 | M2: RSS parser + normalize + dedup | M6: wire analyze_story to Supabase write | M10: Summary + Compare tabs | M2, M6, M10 |
| 9–12 | M5: local embeddings loader | M6: cache-hit logic (skip if analyzed) | M10: Bias tab with phrase highlights | M5, M6, M10 |
| 12–14 | M4: cosine clustering → stories | Help A test end-to-end ingest | M10: Perspectives + Timeline tabs | M4, M10 |

**Gate:** ≥1 story cluster in Supabase with 5+ articles (RSS or seed).

**Commit:** `feat(M2,M4,M5): RSS ingestion and clustering`

---

## P3 — AI Pipeline (Hours 8–18, overlaps P2)

| Hour | Member A | Member B | Member C | Modules |
|---|---|---|---|---|
| 8–12 | Support M2/M4 | M6: combined prompt → Gemini (1 live run on 3 stories) | Continue M10 tabs | M6 |
| 12–15 | M3: wire `/api/stories/{id}` to story_analysis | M6: Groq fallback + seed fallback | Wire frontend to live API (seed mode) | M3, M6 |
| 15–18 | M3: `/compare`, `/timeline` sub-routes | M6: validate all seed stories have analysis | Fix API integration bugs | M3, M6 |

**Gate:** full analysis JSON served for demo story IDs; frontend tabs
populated from the API.

**Commit:** `feat(M6): combined AI analysis pipeline with cache`

**Critical:** switch to `API_MODE=seed` after the one-time live analysis run.

---

## P4 — Frontend + Auth (Hours 10–22, overlaps P3)

| Hour | Member A | Member B | Member C | Modules |
|---|---|---|---|---|
| 10–14 | M8: JWT middleware + get_current_user | — | M11: login, signup, OAuth callback, middleware | M8, M11 |
| 14–18 | M8: `/api/me`, `/api/saved-stories` routes | — | M9: home search + story cards from API | M8, M9 |
| 18–22 | M3: `/api/quota` endpoint | — | M12: SaveButton + `/saved` page | M3, M12 |

**Gate:** Google login works; save story → appears on `/saved`.

**Commit:** `feat(M8,M11,M12): auth and saved stories`

---

## P5 — Integration & Deploy (Hours 22–30)

| Hour | All hands | Modules |
|---|---|---|
| 22–24 | End-to-end test: search → story → all tabs → save | M3, M9, M10, M12 |
| 24–26 | RLS verification; service role vs anon key audit | M1, M8 |
| 26–28 | Deploy: Vercel (frontend) + Railway (backend) | All |
| 28–30 | Quota badge in footer; error states; loading skeletons | M7, M9 |

**Gate:** public URLs work; demo flow completable without terminal access.

**Commit:** `chore: deploy + integration fixes`

---

## P6 — Demo Polish (Hours 30–36)

| Hour | Owner | Task |
|---|---|---|
| 30–32 | C | Run the Presentation Prompt → 6-slide deck |
| 32–33 | All | Rehearse 3-minute demo script (seed mode) |
| 33–34 | B | Record 60s backup video |
| 34–36 | All | Final bug fixes; judge Q&A prep |

**Gate:** success criteria checklist 100% pass (see `DEMO_PLAN.md`).

---

## Optional: Parallel Antigravity Execution

If using Google Antigravity Manager, spawn 3 agents in parallel after the P1
gate:

| Agent | Prompt focus | Modules |
|---|---|---|
| Agent 1 | Backend data pipeline | M2, M4, M5, M7 |
| Agent 2 | AI + analysis | M6, combined prompt |
| Agent 3 | Frontend + auth | M9, M10, M11, M12 |

Shared contract: OpenAPI spec + `demo_stories.json` schema agreed in P1.
Agents merge at the P5 integration checkpoint.

---

## Stand-Up Checkpoints

| Hour | Checkpoint question |
|---|---|
| 6 | Does the seed API return stories? |
| 14 | Are articles clustered in Supabase? |
| 18 | Is full analysis cached for the demo story? |
| 22 | Do all 5 dashboard tabs work? |
| 30 | Are deploy URLs live? |
| 35 | Can we run the demo in under 3 minutes? |

For the rollback order if any of these checkpoints fail, see
`PROJECT_RULES.md` §10.
