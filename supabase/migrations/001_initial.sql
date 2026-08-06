-- 001_initial.sql
-- Initial Schema Migration for PrismNews AI

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. sources: Outlet registry
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    bias_rating TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. articles: Normalized article + 384-dim embedding
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    content TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. stories: Clustered story / topic instance
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline TEXT NOT NULL,
    topic TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. story_articles: Join table between stories and articles
CREATE TABLE IF NOT EXISTS story_articles (
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    PRIMARY KEY(story_id, article_id)
);

-- 5. story_analysis: Cached AI analysis artifact
CREATE TABLE IF NOT EXISTS story_analysis (
    story_id UUID PRIMARY KEY REFERENCES stories(id) ON DELETE CASCADE,
    balanced_summary JSONB NOT NULL,
    comparison JSONB NOT NULL,
    bias_analysis JSONB NOT NULL,
    missing_perspectives JSONB NOT NULL,
    timeline JSONB NOT NULL,
    analyzed_at TIMESTAMPTZ DEFAULT now()
);

-- 6. profiles: 1:1 user profile linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. saved_stories: User bookmarks
CREATE TABLE IF NOT EXISTS saved_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, story_id)
);

-- 8. api_usage: Free-tier daily counters
CREATE TABLE IF NOT EXISTS api_usage (
    service TEXT NOT NULL,
    reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
    calls_today INT DEFAULT 0,
    tokens_today INT DEFAULT 0,
    PRIMARY KEY(service, reset_at)
);

-- 9. api_cache: Raw fetch response cache
CREATE TABLE IF NOT EXISTS api_cache (
    cache_key TEXT PRIMARY KEY,
    response JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Indexing for fast reads
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
CREATE INDEX IF NOT EXISTS idx_stories_topic ON stories(topic);
CREATE INDEX IF NOT EXISTS idx_saved_stories_user_id ON saved_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- profiles: Users read/update only their own row
CREATE POLICY profiles_select_policy ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_policy ON profiles FOR UPDATE USING (auth.uid() = id);

-- saved_stories: Users read/insert/delete only their own bookmarks
CREATE POLICY saved_stories_select_policy ON saved_stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_stories_insert_policy ON saved_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY saved_stories_delete_policy ON saved_stories FOR DELETE USING (auth.uid() = user_id);

-- Public read for news data
CREATE POLICY sources_public_select ON sources FOR SELECT USING (true);
CREATE POLICY articles_public_select ON articles FOR SELECT USING (true);
CREATE POLICY stories_public_select ON stories FOR SELECT USING (true);
CREATE POLICY story_analysis_public_select ON story_analysis FOR SELECT USING (true);

-- User bootstrap trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
