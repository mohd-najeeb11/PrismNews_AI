# API.md — REST Endpoint Contract

> All endpoints are under `/api`. "Auth" = `Optional` means the endpoint
> works anonymously but may return richer data (or allow write access) with
> a valid Supabase JWT Bearer token. "Required" means a valid JWT is
> mandatory or the endpoint returns 401.

---

## Endpoint Table

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/stories?q={topic}` | Optional | Search/browse story clusters |
| GET | `/api/stories/{id}` | Optional | Full analysis payload |
| GET | `/api/stories/{id}/compare` | Optional | Comparison matrix |
| GET | `/api/stories/{id}/timeline` | Optional | Chronological evolution |
| GET | `/api/me` | Required | Current user profile |
| GET | `/api/saved-stories` | Required | User's bookmarked stories |
| POST | `/api/saved-stories` | Required | Bookmark a story `{ story_id }` |
| DELETE | `/api/saved-stories/{id}` | Required | Remove bookmark |
| POST | `/api/ingest/trigger` | Required | Manual refresh; returns `{ mode, newsapi_remaining, gemini_remaining }` |
| GET | `/api/quota` | None | Current API budget status (demo transparency) |
| GET | `/api/health` | None | Health check |

---

## Notes per Endpoint

### `GET /api/stories?q={topic}`
Reads the DB only — never triggers live ingestion on page load. In seed
mode, serves from `demo_stories.json`. Returns a list of story cluster
summaries (headline, topic, source count, thumbnail sources).

### `GET /api/stories/{id}`
Returns the full `story_analysis` payload for the dashboard's Summary tab
plus metadata needed to render Compare/Bias/Perspectives/Timeline without
extra round trips, where practical. Cache-hit is the hot path (Flow 1 in
`ARCHITECTURE.md`) — this should never trigger an LLM call directly; that
only happens via the ingestion pipeline or `/api/ingest/trigger`.

### `GET /api/stories/{id}/compare`
Returns the `comparison[]` array from `story_analysis`: per-source headline,
tone, and emphasis.

### `GET /api/stories/{id}/timeline`
Returns the `timeline[]` array from `story_analysis`: chronological entries
with `published_at`, `source`, `framing_shift`.

### `GET /api/me`
Returns the caller's `profiles` row (`display_name`, `avatar_url`,
`created_at`). JWT is verified against `SUPABASE_JWT_SECRET`; the profile is
fetched by `auth.uid()` from the token, never a client-supplied ID.

### `GET /api/saved-stories` / `POST /api/saved-stories` / `DELETE /api/saved-stories/{id}`
Standard CRUD over `saved_stories`, scoped by RLS to `auth.uid() = user_id`.
`POST` body: `{ story_id }`. Enforces `UNIQUE(user_id, story_id)` — saving
twice is a no-op or a friendly 409, not a duplicate row.

### `POST /api/ingest/trigger`
Manually kicks off an ingest cycle. Must go through `quota_manager` exactly
like the scheduled cron path — no bypassing budget checks because a human
clicked a button. Response shape:
```json
{ "mode": "rss", "newsapi_calls_remaining": 3, "gemini_calls_remaining": 12 }
```
Consider restricting this to authenticated (or admin) users only so it
can't be spammed anonymously.

### `GET /api/quota`
Public, read-only view into `api_usage` for the current day — this is
demo-transparency by design ("look, we're respecting free-tier limits").
No auth required; no write capability.

### `GET /api/health`
Trivial liveness check for deploy verification (Railway/Render + Vercel).

---

## Response Shape Discipline

- Lock the OpenAPI response shapes as a team by Hour 6 of the build (see
  `TASKS.md` P0/P1) — frontend should not have to guess field names.
- `story_analysis` fields (`balanced_summary`, `comparison`, `bias_analysis`,
  `missing_perspectives`, `timeline`) are stored as `jsonb` and should be
  returned as-is from the DB row rather than reshaped per-endpoint, so the
  dashboard tabs map directly onto stored fields. See `AI_PROMPTS.md` for
  the exact JSON schema each field follows.
- Validate all AI-pipeline writes with Pydantic before they ever reach the
  DB, so the API layer can trust the shape of what it reads back.
