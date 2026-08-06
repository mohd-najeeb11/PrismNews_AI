# DEMO_PLAN.md — Demo Script & Judge Prep

---

## 1. Demo Script (3 minutes)

| Time | Beat |
|---|---|
| 0:00–0:30 | Hook: *"Same event, five headlines, five realities."* |
| 0:30–1:00 | Search "Ukraine ceasefire" (or the pre-loaded topic) → open the story |
| 1:00–1:45 | Balanced summary: consensus facts vs. disputed framing |
| 1:45–2:30 | Bias tab: highlight loaded language; missing-perspectives callout |
| 2:30–3:00 | Timeline: *"Fox led with the military angle at 9am; BBC shifted to humanitarian at 2pm."* |
| bonus (~10s, if time allows) | Save the story with Google login |

Run this **only** in `API_MODE=seed` on stage — see `PROJECT_RULES.md` §1.
Pick 2 pre-researched demo topics with known strong multi-source coverage
ahead of time (e.g. climate summit, election, tech regulation) so the
narrative beats above always have real material to point at.

---

## 2. Innovation Angles for Judges

Lead with these differentiators in the pitch — they're the actual answer to
"why is this better than a generic news aggregator":

1. **Explainability first** — not just a bias score; show *which phrases*
   drive the label and *why*.
2. **Missing Perspective Detector** — proactive gap analysis, not passive
   aggregation.
3. **Consensus vs. dispute split** — the balanced summary separates agreed
   facts from contested framing instead of blending them.
4. **Story Evolution Timeline** — shows how narratives shift hour by hour,
   unlike static aggregators.
5. **Transparency metadata** — display the model used, analysis timestamp,
   and source list to build trust in the output itself.
6. **Personalized transparency** — authenticated users build a saved
   reading list to track stories over time.
7. **Quota-transparent design** — show judges the remaining API budget live;
   proves the architecture is sustainable on free-tier infrastructure, not
   a demo-day illusion.

---

## 3. Success Criteria (final checklist before judging)

- [ ] 5+ sources clustered into 1 story
- [ ] Balanced summary with consensus vs. dispute sections
- [ ] Side-by-side comparison of ≥3 articles
- [ ] ≥3 explainable bias highlights with quoted text
- [ ] Missing perspectives list (≥2 items)
- [ ] Timeline with ≥4 chronological entries
- [ ] Deployed URL + 3-minute live demo without manual backend steps
- [ ] User can sign up/login (email or Google) and save a story to `/saved`
- [ ] Entire demo runnable with `API_MODE=seed` (zero live API calls)
- [ ] Quota manager prevents exceeding free-tier limits; UI shows remaining
      budget

---

## 4. What to Prepare Before Hour 0

- [ ] Supabase project created; Google OAuth credentials ready
- [ ] Gemini API key (free at ai.google.dev); Groq key as backup
- [ ] NewsAPI dev key, GitHub repo
- [ ] List of 10 RSS feed URLs across the political spectrum
- [ ] Static `allsides_bias.json` mapping ~20 outlet names to L/C/R (static
      reference file, not a live scrape)
- [ ] Pre-run offline script: ingest 3 topics via RSS + analyze once with
      Gemini → export `seed.sql` + `demo_stories.json`
- [ ] 2 pre-researched demo topics with known multi-source coverage
- [ ] Shared Figma/wireframe sketch (30 min)
- [ ] Team rule agreed out loud: `API_MODE=seed` unless explicitly approved

---

## 5. Backup Plan

- Record a 60-second backup video during Hour 33–34 (P6, see `TASKS.md`) in
  case live wifi/deploy fails during judging.
- If behind schedule at Hour 18, follow the rollback order in
  `PROJECT_RULES.md` §10 — never cut the Bias tab, the analysis output, or
  the seed API, since those are what the demo script above actually depends
  on.

---

## 6. Anticipated Judge Q&A (prep 3 crisp answers)

Use these as prompts to prepare your own answers ahead of time — they map
directly onto the architecture decisions in `DECISIONS.md`:

1. *"How do you keep this from just amplifying more misinformation?"* →
   Point to the consensus-vs-dispute split and the "transparency, not
   adjudication" tone rule in the AI prompt.
2. *"What happens when you exceed your free API budget in production?"* →
   Point to the quota manager, the cache-first architecture, and the
   graceful seed/cached fallback.
3. *"Why not just use GPT-4 for everything?"* → Point to the free-tier-first
   stack decision and the single-combined-prompt design that keeps this
   sustainable at zero marginal cost per story.

---

## 7. Pitch Deck Generation

Use the Copy-Paste Presentation Prompt (Hour 30–32, see `TASKS.md` P6) fed
into Gemini, Gamma, Canva, or NotebookLM to generate a 6-slide deck covering:
Problem → Solution → Key Features → System Architecture → Innovation &
Differentiation → Demo Walkthrough + Future Roadmap. Keep the tone
confident, clear, and non-partisan — never claim an outlet is "wrong,"
emphasize transparency and informed choice instead.
