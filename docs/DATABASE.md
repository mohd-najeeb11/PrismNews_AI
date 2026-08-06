# DATABASE.md — Supabase Postgres Schema

> Managed via SQL migrations in `supabase/migrations/`. `profiles.id` links
> to `auth.users.id`. Enable the `pgvector` extension in Supabase before
> running the first migration.

---

## 1. Full Schema

```sql
-- Public read; backend service role writes
sources(id uuid PK, name text, url text, bias_rating text)

articles(id uuid PK, source_id uuid FK, title text, url text UNIQUE, content text,
         published_at timestamptz, embedding vector(384), created_at timestamptz)

stories(id uuid PK, headline text, topic text, created_at timestamptz)

story_articles(story_id uuid FK, article_id uuid FK, PRIMARY KEY(story_id, article_id))

story_analysis(story_id uuid PK FK, balanced_summary jsonb, comparison jsonb,
               bias_analysis jsonb, missing_perspectives jsonb, timeline jsonb,
               analyzed_at timestamptz)

-- Auth-linked tables
profiles(id uuid PK REFERENCES auth.users, display_name text, avatar_url text,
         created_at timestamptz)

saved_stories(id uuid PK, user_id uuid FK REFERENCES profiles, story_id uuid FK REFERENCES stories,
              saved_at timestamptz DEFAULT now(), UNIQUE(user_id, story_id))

-- API quota + cache (free-tier guard)
api_usage(service text, reset_at date, calls_today int DEFAULT 0, tokens_today int DEFAULT 0,
          PRIMARY KEY(service, reset_at))

api_cache(cache_key text PK, response jsonb, expires_at timestamptz)
```

---

## 2. Table Notes

| Table | Purpose | Written by |
|---|---|---|
| `sources` | Outlet registry (name, url, bias rating) | Seed / manual |
| `articles` | Normalized article + 384-dim local embedding | M2 Ingestion |
| `stories` | A clustered story (a topic instance) | M4 Clustering |
| `story_articles` | Many-to-many join between stories and articles | M4 Clustering |
| `story_analysis` | Cached AI output — the expensive artifact | M6 AI Pipeline |
| `profiles` | Public-facing user profile, 1:1 with `auth.users` | Trigger on signup |
| `saved_stories` | User bookmarks | M12 Saved Stories UI (via M8 API) |
| `api_usage` | Daily counters per external service | M7 Quota Manager |
| `api_cache` | Short-TTL cache for raw fetch results | M2 Ingestion |

---

## 3. Row Level Security (RLS)

**Mandatory policies:**

- `profiles` — users may `SELECT`/`UPDATE` **only their own row**
  (`auth.uid() = id`)
- `saved_stories` — users may `SELECT`/`INSERT`/`UPDATE`/`DELETE` **only
  their own rows** (`auth.uid() = user_id`)
- `stories`, `articles`, `story_analysis` — public `SELECT`;
  `INSERT`/`UPDATE` via **service role only** (backend ingestion/AI pipeline)

Audit rule: before deploy, verify every table has RLS enabled and that no
policy accidentally grants the anon key write access to `stories`,
`articles`, or `story_analysis`.

---

## 4. Profile Bootstrap Trigger

Auto-creates a `profiles` row the moment a user signs up via Supabase Auth:

```sql
CREATE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Attach this to an `AFTER INSERT` trigger on `auth.users`.

---

## 5. pgvector

Enable the `pgvector` extension in the Supabase dashboard (or via migration)
before creating the `articles` table — `embedding vector(384)` depends on
it. Embeddings are computed locally with
`sentence-transformers/all-MiniLM-L6-v2` (zero API cost) and used for
cosine-similarity clustering in M4.

---

## 6. Storage Budget

Free tier cap is 500 MB — stay under 200 MB as a working budget:

- Store embeddings as `vector(384)`, not raw arrays or text.
- Truncate `articles.content` to ~2,000 characters — don't store full raw
  article bodies.
- Don't persist raw API response dumps; only normalized fields.

---

## 7. Migration Checklist

- [ ] Enable `pgvector` extension
- [ ] Create all tables in the order: `sources` → `articles` → `stories` →
      `story_articles` → `story_analysis` → `profiles` → `saved_stories` →
      `api_usage` → `api_cache`
- [ ] Add RLS policies for `profiles` and `saved_stories`
- [ ] Add public-read policies for `stories`, `articles`, `story_analysis`
- [ ] Add the `handle_new_user()` trigger on `auth.users`
- [ ] Seed 2 demo stories (fully pre-analyzed) via `supabase/seed.sql`
