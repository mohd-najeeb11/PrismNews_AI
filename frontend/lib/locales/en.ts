export const en = {
  // Navigation Bar
  brand_name: "PrismNews AI",
  nav_home: "Home",
  nav_saved_stories: "Saved Stories",
  nav_api_quota: "API Quota",
  nav_live_mode: "Live Mode",
  nav_seed_mode: "Seed Mode",

  // Hero & Search
  hero_badge: "Explainable AI News Transparency Engine",
  hero_title_line1: "Unpack the News from",
  hero_title_line2: "Every Angle & Framing",
  hero_subtitle: "See how different news outlets cover the same story side-by-side. Uncover hidden bias, detect missing perspectives, and track how narrative framing shifts in real time.",
  search_placeholder: "Search any live news topic, event, or URL (e.g. Nvidia AI, https://reuters.com/...)...",
  search_button: "Analyze",
  search_fetching: "Fetching...",
  search_live_banner: "Fetching live news coverage & running Gemini AI analysis for",
  popular_topics: "Popular Topics:",

  // Features Bar
  feat_balanced: "Balanced Summaries",
  feat_comparison: "Side-by-Side Comparison",
  feat_blindspots: "Blindspot Detection",
  feat_timelines: "Narrative Timelines",

  // Category Tabs & Feed
  cat_all: "All",
  showing_clusters: "Showing",
  story_clusters: "story clusters",
  no_stories_found: "No Story Clusters Found",
  no_stories_sub: "Try clearing your search query or selecting a different topic category.",
  view_full_analysis: "View Full 5-Tab Analysis",
  outlets_count: "Outlets",

  // Story Detail Page
  story_detail_back: "Back to Explore Feed",
  original_english: "Original (English)",
  translated_language: "Translated",
  translation_unavailable: "Translation currently unavailable.",
  translating_content: "Translating AI Analysis into",
  language_badge: "Language",
  cached_translation: "Cached Translation",

  // Tabs
  tab_summary: "Balanced Summary",
  tab_comparison: "Side-by-Side Grid",
  tab_bias: "Explainable Bias",
  tab_blindspots: "Uncovered Blindspots",
  tab_timeline: "Narrative Timeline",
  tab_transparency: "AI Transparency",

  // Footer & How it works
  how_it_works_title: "How PrismNews AI Works",
  how_it_works_sub: "An automated, transparent pipeline converting raw news feeds into unbiased media literacy metrics.",
  step1_title: "Multi-Spectrum Ingest",
  step1_desc: "Ingests RSS feeds and news APIs continuously across left, center, and right outlets.",
  step2_title: "Vector Clustering",
  step2_desc: "Groups matching stories from different publishers using local sentence embeddings.",
  step3_title: "Explainable Bias AI",
  step3_desc: "Gemini 2.0 Flash extracts loaded language, evaluates tone, and highlights unsaid perspectives.",
  step4_title: "Transparent Reading",
  step4_desc: "Readers view consensus facts, side-by-side outlet grid, and timeline narrative shifts.",

  footer_copy: "PrismNews AI — Transparent, Neutral, Multi-Spectrum News Ingestion & Analysis",
};

export type LocaleKeys = keyof typeof en;
