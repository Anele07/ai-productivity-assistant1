
# TaskPilot v1.0 — Product Specification & Implementation Plan (Refined)

A refinement of the previous plan. The technical architecture (TanStack Start + Lovable Cloud + Lovable AI Gateway, universal `generations` table, `_authenticated` gate, streaming server route for chat) is preserved. What changes is the product layer on top: identity, flow, cross-tool intelligence, and the design system.

---

## 0. What Stays (Strengths From v0)

Keep verbatim — these are the load-bearing decisions:

- **Stack:** TanStack Start v1 + Lovable Cloud + AI SDK → Lovable AI Gateway, edge deploy.
- **Data model:** universal `generations` row per AI output; `action_items` and `tasks` as structured child tables; `analytics_events` as the event spine.
- **Auth:** email/password + Google, `_authenticated` gate, `/reset-password`, sign-out hygiene.
- **Chat surface:** `/api/chat` streaming route, `useChat`, `message.parts`, threads keyed by URL.
- **RLS + roles:** `user_roles` + `has_role()`, per-workspace policies.
- **Roadmap phases 0–10** — refine content, keep the order.

Nothing is removed. Everything below adds identity, connective tissue, and craft.

---

## 1. Product Identity (new)

- **Name:** TaskPilot
- **Tagline:** *"Your workday, on autopilot."*
- **One-line value prop:** TaskPilot turns the repetitive parts of office work — email, meetings, planning, research — into one calm, AI-assisted workflow that remembers what you've done and suggests what's next.
- **Personality:** *Calm, competent co-pilot.* Not chirpy. Not sci-fi. Confident, quiet, precise — the tone of a great chief-of-staff.
- **Voice principles:** short sentences, verbs first ("Draft the email", "Plan the day"), never emoji-heavy, never "As an AI…".
- **Brand promise (shown on landing + Responsible AI):** *"AI that drafts. You decide."*

**Design language keywords:** *editorial calm, generous whitespace, one confident accent, monochrome depth, precise typography, motion that reassures rather than performs.*

**Why:** the market is crowded with loud, purple-gradient AI tools. A calm, editorial identity is more credible in a workplace context (Notion/Linear/Vercel positioning) and is defensible against generic AI aesthetics per platform guidance.

---

## 2. Design System Refinement

Concrete replacement for the placeholder tokens in the current `styles.css`.

- **Palette (light):** near-white paper `#FAFAF7`, ink `#111214`, muted graphite `#5B5F66`, hairline border `#E7E6E1`, single accent — *signal blue* `#2E5BFF` used sparingly for CTAs and active states, plus a warm success `#3F7D58` and a restrained warning `#B45309`.
- **Palette (dark):** ink base `#0B0C0E`, elevated surface `#141518`, text `#EDEDEA`, muted `#8A8F97`, same accent tuned brighter.
- **Typography pair:** **Instrument Serif** (display, for hero + section headers, gives editorial weight) + **Inter Tight** or **Geist** for UI/body. Numerals: tabular. Never Poppins.
- **Iconography:** `lucide-react` at 1.5px stroke, consistent 20/16px sizes, never mixed with emoji.
- **Radius:** `--radius: 14px` (cards), `10px` inputs, `999px` pill filters.
- **Shadow scale:** none / `elevation-1` (soft 1px + 8px), `elevation-2` (12px 32px, 8% ink) — no glowy purple shadows.
- **Spacing:** 4/8/12/16/24/32/48/64 — enforce via Tailwind spacing scale only.
- **Motion (Framer Motion):** 180ms ease-out for enter, 120ms for exit, 320ms for hero. `prefers-reduced-motion` respected globally. One signature motion: streaming tokens fade in with 40ms stagger.
- **Component variants:** shadcn `Button` gets `default` (ink), `accent` (signal blue), `ghost`, `outline`; `Card` gets `default` and `elevated`. All new colors added as CSS vars in `src/styles.css`.
- **Responsive:** mobile-first, sidebar → sheet under `md`, tool split-pane stacks under `lg` with sticky action bar.

**Why:** a specific, opinionated system prevents the "generic AI dashboard" outcome the brief warns against, and gives every subsequent screen a consistent voice.

---

## 3. Landing Page — Persuasion Architecture

Route: `/`. Not a feature list — a scroll narrative.

1. **Hero:** headline *"Your workday, on autopilot."* + sub *"Draft email, summarize meetings, plan the week, research anything — one workspace that remembers."* Two CTAs: **Start free** (primary), **See how it works** (scrolls to demo). Right side: a real-looking product still (not a stock illustration).
2. **Logo strip** — clearly labeled *"Built for teams like these"* with sample company-type labels (agencies, consultancies) — no fake logos.
3. **Interactive feature showcase:** tabbed component (Email / Meeting / Planner / Research / Assistant). Each tab shows a mocked but realistic in-app screenshot + one-sentence outcome. Tabs animate with Framer Motion.
4. **The workflow demo:** a horizontal 5-step visual — *Meeting → Action items → Planner → Follow-up email → History* — animating on scroll. This is the *"one intelligent workspace"* proof.
5. **Benefits (outcome-led, not feature-led):** *Reclaim ~5 hours a week · Never lose a meeting decision · Start every day with a plan · Keep every draft searchable.*
6. **Testimonials:** 3 cards, explicitly marked *"Illustrative — collected during pilot"* to stay honest.
7. **Responsible AI strip:** short paragraph + link to `/responsible-ai`. Trust signal.
8. **FAQ (accordion):** data privacy, model used, pricing intent, does it replace my job, can I export.
9. **Final CTA band:** *"Start your first draft in under a minute."*
10. **Footer:** product, company, legal, socials, status.

SEO: unique `head()` per route with real title/description/OG; leaf OG image on landing only (built server-side or user-provided absolute URL — never a relative path).

**Why:** the brief asks the landing page to *persuade*. A narrative with a workflow demo directly answers the "one workspace vs. scattered tools" positioning.

---

## 4. Dashboard — Command Center (redesigned)

Route: `/dashboard`. Replaces the earlier "three empty cards" sketch.

**Layout (12-col grid, editorial):**

- **Row 1 — Greeting band:** *"Good morning, {name}. Here's your workday."* + date, weather-free, quiet. Right side: **⌘K** hint.
- **Row 2 — Quick Actions (4 cards):** Draft Email · Summarize Meeting · Plan My Day · Research Topic. Keyboard shortcuts visible (E, M, P, R). One-click launches the tool with focus already in the input.
- **Row 3 — Today panel (left, 8 cols):** *"Suggested next actions"* — AI-generated 3-item list derived from recent activity (e.g. *"You have 4 open action items from Monday's standup — plan them?"*). Falls back to onboarding cards for new users.
- **Row 3 — Focus panel (right, 4 cols):** **Productivity Streak** (days used in a row), **Time Saved this week** (Σ per-tool estimate), **Most-used tool** — all numbers-only, no charts.
- **Row 4 — Recent work:** last 6 `generations` as cards with tool icon, title, timestamp, and a resume button (`→ /history/$id`).
- **Row 5 — Weekly activity sparkline:** small, one line, no legend. Clicking opens `/analytics`.

**Empty-state behavior:** every panel has a first-run copy variant that is a *guide*, not a placeholder — e.g. *"No streak yet — draft one email to start."*

**Why:** turns the dashboard into a workflow launcher + memory surface (the two things the brief calls out) without inventing fake stats.

---

## 5. Cross-Tool Intelligence — The "One Workspace" Layer

This is the biggest addition. Tools stop being islands.

**Canonical workflow 1 — Meeting to follow-up:**
`Meeting Intelligence` → auto-extracts `action_items` → **"Send these to Planner"** button creates `tasks` rows → **"Draft follow-up email"** button pre-fills the Email tool with attendees + decisions → the resulting draft, plan, and summary all link back to the same `generation.parent_id`.

**Canonical workflow 2 — Research to brief:**
`Research Assistant` → **"Turn into executive summary email"** → Email tool opens with the research summary as context → saved draft references the research `generation_id`.

**Canonical workflow 3 — Planner to journal:**
`Task Planner` end-of-day → **"Wrap up today"** button → Assistant generates a short daily recap saved as a generation.

**Canonical workflow 4 — Assistant as router:**
`AI Assistant` has tool-calling access to `generateEmail`, `summarizeMeeting`, `planDay`, `researchTopic`. Ask *"draft a reply to Priya about the Q3 launch"* and it hands off to the Email tool with structured output, which the user can then open in the full editor.

**Schema support (small additions to prior model):**
- `generations.parent_id` (self-FK) — links derived outputs to their source.
- `generations.linked_ids` (uuid[]) — many-to-many for cases where one draft cites multiple sources.
- `tasks.source_generation_id` and `action_items.source_generation_id` already implied — make explicit.

**Why:** directly satisfies the brief's "not unrelated AI tools" requirement, and the `parent_id` link powers a "Journey" view later (post-v1).

---

## 6. Prompt Library — Professional Templates

Route: `/library`. Redesigned as a curated library, not a bookmarks list.

- **Seeded on signup** with ~12 professional templates across 5 categories: *Client Communication, Internal Comms, Planning, Research, HR & People* — the ones the brief lists (proposal, meeting follow-up, performance review, exec summary, interview prep, daily plan, etc.).
- **Template shape:** `name`, `category`, `tool` (which tool it opens in), `body` with `{{variables}}`, `variable_schema` (label + type + default), `is_system` (seeded vs user), `is_shared` (workspace).
- **UI:** left rail categories, main grid of template cards, top bar with search + filter chips (tool, category, mine/shared/system). Card actions: **Use**, **Favorite**, **Duplicate**, **Edit** (own only).
- **"Use" flow:** opens a variable dialog → filled prompt is sent into the target tool. Never a raw prompt paste.
- **Save flow:** every tool page has *"Save as template"* on any generation — turns a working prompt into a library entry in one click.

**Why:** upgrades the library from storage into an *asset* that keeps improving with use.

---

## 7. Analytics That Motivate

Route: `/analytics`. Metrics are outcome-framed, not vanity.

- **Time saved (headline):** Σ over `analytics_events` where each tool has a calibrated `minutes_saved_per_run` constant (email 6, meeting 15, planner 8, research 20, assistant 3). Shown as *"You saved ≈ 3h 20m this week."*
- **Weekly Productivity Score (0–100):** weighted mix of `active_days / 7`, `generations_completed`, `action_items_completed_ratio`, capped and smoothed. Never negative.
- **Streak:** consecutive active days.
- **AI usage trend:** last-8-weeks sparkline of generations, one line.
- **Most-used tool + tool mix:** small stacked bar.
- **Personal insights (AI-generated weekly):** 1 short paragraph — *"You draft most emails on Monday mornings — want me to pre-open the Email tool then?"* Generated once/week and stored, not on every visit (cost + calm).
- **Empty state:** *"No productivity data yet. Use TaskPilot for a couple of days to unlock personalized insights."*

**Why:** the brief explicitly asks for motivating analytics. Time-saved and streaks are the two mechanics proven to drive weekly retention in productivity SaaS.

---

## 8. AI Assistant — Personal Workplace Assistant

Not a generic chatbot. Context-aware.

- **Context bundle sent server-side each turn** (assembled inside the `/api/chat` handler, never leaked to the client): user's display name + timezone, last 5 `generations` titles, open `tasks` for today, favorited templates, current thread history.
- **Tool-calling:** the four generators registered as tools; `stepCountIs(50)` on the loop.
- **Suggested prompts** on empty thread, personalized: *"Summarize yesterday's standup", "Plan tomorrow", "Draft a follow-up to your last research"*.
- **Thread management:** URL-driven (`/tools/assistant/$threadId`), DB-persisted via `toUIMessageStreamResponse({ originalMessages, onFinish })`. Full history sent each call (stateless model rule).
- **Boundaries surfaced in-UI:** disclaimer strip on first message of every thread, retryable 429/402 error states.

**Why:** context is what separates a *workplace* assistant from ChatGPT-in-a-sidebar.

---

## 9. Empty States — Guidance, Not Blanks

Every list/analytics/history surface ships two variants: *first-run guide* and *filtered-empty*.

- **Dashboard first-run:** three onboarding cards (Draft your first email · Summarize a meeting · Plan today) → each collapses once used.
- **History empty:** *"No AI generations yet. Create your first document to start building your workspace."* + one primary CTA.
- **Analytics empty:** *"No productivity data yet. Use TaskPilot for a couple of days to unlock personalized insights."*
- **Library empty (user templates):** *"You haven't saved a template yet. Turn any prompt that worked into a reusable template."*
- **Assistant empty thread:** 4 suggested-prompt chips based on user context (or generic ones for first-run).
- **Search-empty:** *"No results for '{q}'. Try a different keyword or clear filters."*

Illustrations: none. Empty states use a single small icon + one sentence + one CTA. Restraint reinforces the calm identity.

---

## 10. Standout Features (achievable, defensible)

Pick these three as "wow" — each is small enough to build and honest about AI's role:

1. **Journey View (per generation)** — clicking any output in History shows a lightweight timeline: the meeting → the extracted action items → the plan they landed in → the follow-up email drafted from them. Powered by `parent_id`/`linked_ids`. *Why:* visually proves the "one intelligent workspace" claim in one screen.
2. **Weekly AI-generated personal insight** on `/analytics` (see §7). *Why:* demonstrates thoughtful AI use beyond prompt→answer, and is a genuine retention driver.
3. **⌘K Command Palette** with actions + navigation + recent generations + templates, all searchable. *Why:* Linear/Notion-grade craft cue; small to build; huge perceived quality lift.

Each is realistic in scope, differentiates from a typical AI assignment, and reuses existing tables (`generations`, `analytics_events`, `prompt_templates`) — no new architecture.

---

## 11. Accessibility & Responsible AI (kept, tightened)

- WCAG 2.1 AA target, single `<h1>` per route, keyboard-navigable everywhere.
- ARIA live region on every streaming output.
- Contrast checked in both themes; motion respects `prefers-reduced-motion`.
- Responsible AI page rewritten in plain language, linked from: landing footer, first message of every AI thread, and Settings.
- Every AI output carries a small "AI-generated — verify important details" chip.

---

## 12. Security (unchanged, restated)

RLS on every table; grants to `authenticated` + `service_role`; roles via `user_roles` + `has_role()`; every `createServerFn` uses `requireSupabaseAuth` + Zod; `LOVABLE_API_KEY` server-only; HIBP leaked-password check on; rate limit per user on AI endpoints; `/api/public/*` reserved for signed webhooks only.

---

## 13. Updated Roadmap

Phases 0–2 unchanged from v0 (foundations, auth, generations core).

- **Phase 3 — Design system + Landing.** Ship the token system, typography, motion primitives, and the full landing narrative. Everything after inherits the visual bar.
- **Phase 4 — Dashboard command center.** Greeting, Quick Actions, Suggested Next, Recent Work, Streak, Time Saved. Empty-state-first.
- **Phase 5 — Smart Email + template seeding.** First tool end-to-end; seed the Prompt Library on signup.
- **Phase 6 — Meeting Intelligence + Task Planner** with the *"Send to Planner"* and *"Draft follow-up"* handoffs. First cross-tool workflow ships here.
- **Phase 7 — Research Assistant** + *"Turn into executive summary email"* handoff.
- **Phase 8 — AI Assistant (context-aware chat + tool-calling).**
- **Phase 9 — Prompt Library full UI** (browse/search/favorite/duplicate/customize).
- **Phase 10 — Analytics** (time saved, streak, score, weekly insight).
- **Phase 11 — Standout polish:** ⌘K palette, Journey View, weekly insight generation, accessibility pass, SEO/OG, security scan, publish.
- **Phase 12+ (post-launch):** teams/invites, exports (PDF/DOCX), Google/Microsoft integrations, uploads/OCR/voice, billing.

---

## 14. Success Criteria for v1.0

- New user can go landing → sign up → first generation in **under 90 seconds**.
- Every tool output is streamed, saveable, editable, regeneratable, and copyable.
- Dashboard, History, Analytics, and Library all show *real user data or a guided empty state* — never fake.
- At least one cross-tool handoff works end-to-end (Meeting → Planner → Email).
- Accessibility audit passes AA on the five primary routes.
- Lighthouse ≥ 90 on landing across the four categories.

---

Approve this refined specification and I'll begin Phase 3 (design system + landing), building on the Phase 0–2 foundations already scoped.
