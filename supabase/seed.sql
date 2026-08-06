-- seed.sql: Demo sources, stories, articles, and pre-analyzed AI cache

-- 1. Seed News Outlets
INSERT INTO sources (id, name, url, bias_rating) VALUES
('11111111-1111-1111-1111-111111111111', 'BBC News', 'https://bbc.com', 'Center-Left'),
('22222222-2222-2222-2222-222222222222', 'Reuters', 'https://reuters.com', 'Center'),
('33333333-3333-3333-3333-333333333333', 'Fox News', 'https://foxnews.com', 'Right'),
('44444444-4444-4444-4444-444444444444', 'CNN', 'https://cnn.com', 'Left'),
('55555555-5555-5555-5555-555555555555', 'Associated Press', 'https://apnews.com', 'Center')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Story 1: Global AI Governance Accord
INSERT INTO stories (id, headline, topic, created_at) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'Global Tech Summit Reaches Landmark AI Safety Agreement', 'Artificial Intelligence', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Articles for Story 1
INSERT INTO articles (id, source_id, title, url, content, published_at) VALUES
('e1111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Nations Sign Historic AI Framework at Geneva Summit', 'https://bbc.com/news/tech-ai-framework-2026', 'Representatives from 40 nations agreed on binding safety guardrails for frontier artificial intelligence models...', NOW() - INTERVAL '3 hours'),
('e2222222-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Global Accord Sets Limits on Autonomous AI Systems', 'https://reuters.com/technology/global-accord-ai-2026', 'A international treaty signed in Geneva mandates independent audits for advanced machine learning models prior to deployment...', NOW() - INTERVAL '2 hours'),
('e3333333-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'New Geneva AI Deal Raises Concerns Over Tech Overregulation', 'https://foxnews.com/tech/geneva-ai-deal-overregulation-fear', 'Tech industry leaders warned that new international mandates signed in Switzerland could stifle American innovation...', NOW() - INTERVAL '1 hour')
ON CONFLICT (url) DO NOTHING;

-- 4. Link Articles to Story 1
INSERT INTO story_articles (story_id, article_id) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000001'),
('a1b2c3d4-0000-0000-0000-000000000001', 'e2222222-0000-0000-0000-000000000002'),
('a1b2c3d4-0000-0000-0000-000000000001', 'e3333333-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 5. Seed Analysis for Story 1
INSERT INTO story_analysis (story_id, balanced_summary, comparison, bias_analysis, missing_perspectives, timeline, analyzed_at) VALUES
('a1b2c3d4-0000-0000-0000-000000000001',
 '{
   "consensus_facts": ["Delegates from over 40 countries signed a safety framework in Geneva.", "The agreement introduces auditing guidelines for frontier AI models.", "The treaty was backed by major international tech delegations."],
   "disputed_points": ["Whether the auditing process burdens startups excessively.", "Enforcement mechanisms for non-signatory nations."],
   "neutral_summary": "Forty nations assembled in Geneva to ratify a safety agreement establishing independent audit requirements for frontier AI models. While proponents emphasize risk reduction, industry critics highlight potential headwinds for competitive innovation."
 }'::jsonb,
 '[
   {"source": "BBC News", "headline": "Nations Sign Historic AI Framework at Geneva Summit", "tone": "neutral", "emphasis": "international cooperation"},
   {"source": "Reuters", "headline": "Global Accord Sets Limits on Autonomous AI Systems", "tone": "factual", "emphasis": "regulatory mechanics"},
   {"source": "Fox News", "headline": "New Geneva AI Deal Raises Concerns Over Tech Overregulation", "tone": "critical", "emphasis": "economic impact on domestic tech"}
 ]'::jsonb,
 '[
   {
     "source": "BBC News",
     "framing": ["global cooperation", "risk reduction"],
     "tone": "optimistic",
     "loaded_phrases": [{"text": "historic milestone", "reason": "Laudatory phrasing emphasizing significance"}]
   },
   {
     "source": "Fox News",
     "framing": ["overregulation", "innovation penalty"],
     "tone": "skeptical",
     "loaded_phrases": [{"text": "stifle American innovation", "reason": "Emotionally charged protectionist narrative"}]
   }
 ]'::jsonb,
 '{
   "covered": ["Government representatives", "Tech industry executives"],
   "missing": ["Open-source developer community perspectives", "Consumer privacy advocacy groups"]
 }'::jsonb,
 '[
   {"published_at": "2026-08-06T18:00:00Z", "source": "BBC News", "framing_shift": "Focus on summit opening and international consensus building."},
   {"published_at": "2026-08-06T19:00:00Z", "source": "Reuters", "framing_shift": "Focus on legal language and mandatory compliance rules."},
   {"published_at": "2026-08-06T20:00:00Z", "source": "Fox News", "framing_shift": "Pivot toward industry pushback and global market competitiveness concerns."}
 ]'::jsonb,
 NOW())
ON CONFLICT (story_id) DO NOTHING;
