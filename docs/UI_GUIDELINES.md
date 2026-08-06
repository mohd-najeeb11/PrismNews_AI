# UI_GUIDELINES.md — Frontend Design & Pages

---

## 1. Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** — fast, polished UI without custom design
  system overhead
- **Recharts** or **vis-timeline** — bias spectrum + story timeline charts
- **@supabase/supabase-js** + **@supabase/ssr** — client and server-side
  session handling

---

## 2. Pages

1. **Login / Signup** (`/login`, `/signup`) — email + Google OAuth buttons
2. **Auth Callback** (`/auth/callback`) — exchange code for session
3. **Home / Search** — search bar + trending story cards; nav shows login
   or avatar depending on session state
4. **Story Dashboard** (`/story/[id]`) — hero balanced summary + source
   count badge + **Save** button (prompts login if anonymous)
5. **Comparison Tab** — outlet cards in a grid, color-coded by framing
6. **Bias Tab** — highlighted quotes, framing radar chart, source spectrum
   bar
7. **Perspectives Tab** — covered vs. missing checklist with icons
8. **Timeline Tab** — vertical timeline with framing-shift annotations
9. **Saved Stories** (`/saved`) — auth-protected list of bookmarked
   clusters

---

## 3. Component Map (by module)

| Module | Components |
|---|---|
| M9 Frontend Shell | `app/layout.tsx`, `app/page.tsx`, `NavBar.tsx`, `QuotaBadge.tsx` |
| M10 Story Dashboard | `app/story/[id]/page.tsx`, `BiasChart.tsx`, `ComparisonGrid.tsx`, `Timeline.tsx`, `PerspectivesList.tsx` |
| M11 Auth Pages | `app/login/`, `app/signup/`, `app/auth/callback/`, `lib/supabase/` |
| M12 Saved Stories | `app/saved/page.tsx`, `SaveButton.tsx` |

---

## 4. UI Requirements Per Tab

- **Bias tab:** highlight loaded phrases (e.g. in yellow) with a tooltip
  showing the rationale from `bias_analysis[].loaded_phrases[].reason`.
  This is the tab that sells "explainability first" to judges — don't
  ship it as a bare score.
- **Comparison tab:** grid of outlet cards, each with a tone badge
  (neutral/critical/sympathetic, etc.) pulled from `comparison[].tone`.
- **Perspectives tab:** green check for `covered[]`, red alert icon for
  `missing[]`.
- **Timeline tab:** vertical timeline with source logos and framing-shift
  notes per entry (`timeline[].framing_shift`).
- **Save button:** prompts a login modal if the user is anonymous — don't
  hard-redirect away from the story they're reading.

---

## 5. Demo UX Polish

- Loading skeletons on every tab — never a blank white flash while data
  loads.
- One clear "Analyze Story" CTA with visible progress steps when triggering
  a fresh analysis: *"Clustering → Summarizing → Detecting bias…"* — this
  makes the (occasionally slow) LLM latency feel intentional rather than
  broken.
- Quota status badge in the footer, visible at all times:
  `"API mode: seed | NewsAPI: 5/8 | Gemini: 12/20"` — this is a deliberate
  trust-building feature, not just a debug widget (see `DEMO_PLAN.md`
  §Innovation Angles).
- Demo flow stays fully **public** — no forced login to browse or view
  analysis. Auth is demonstrated mid-demo, specifically by saving a story.

---

## 6. Visual Direction

- Clean, professional, trust-focused: blues/grays as the base palette, with
  a distinct accent color reserved for the bias spectrum visualization so
  it reads as its own signal, not just decoration.
- Avoid anything that looks partisan or editorializing in the chrome itself
  — the app's own visual voice should read as neutral, since the product's
  entire pitch is transparency.

---

## 7. Access Model (drives what each page shows)

| Resource | Anonymous | Authenticated |
|---|---|---|
| Browse/search stories | Yes | Yes |
| View full analysis | Yes | Yes |
| Save/bookmark stories | No | Yes |
| View saved stories list | No | Yes |
| Trigger manual ingest | No | Yes (or admin-only) |

---

## 8. Implementation Split

- **Member C (frontend):** `/login`, `/signup`, auth callback route,
  middleware session refresh, nav avatar + logout.
- **Member A (backend):** `get_current_user()` dependency, JWT verification
  middleware.
- **Supabase dashboard:** enable the Google provider, set redirect URLs for
  both localhost and the Vercel deploy URL — do this early (see risk
  register in `PROJECT_RULES.md`, redirect mismatches are a known trap).
