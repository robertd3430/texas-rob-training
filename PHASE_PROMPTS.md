# Texas Rob Training — Phase Prompts

Copy-paste prompts for each build phase, run in order inside `claude` at the repo root (with `CLAUDE.md` present so context loads automatically). Each entry lists the model to switch to first.

Workflow per phase: switch model → paste prompt → review the diff/output → run the app or tests → say "continue" or fix issues → move to the next phase.

---

## Phase 0 — Scaffold
`/model sonnet`

> Read CLAUDE.md. Start Phase 0: scaffold with `create-next-app` (Next.js 16, App Router, TypeScript strict, Tailwind, ESLint). Add Prettier, Husky pre-commit (lint + typecheck), and a GitHub Actions CI skeleton that runs lint/typecheck/build on PRs. Show me the resulting file tree and stop before Phase 1.

## Phase 1 — Database
`/model fable`

> Start Phase 1: design and write the Supabase migration SQL for `exercises`, `routines`, `routine_exercises`, `workouts`, `workout_sets`, and `training_maxes`, per the data model notes in CLAUDE.md. Include RLS policies scoped to `auth.uid()` on every table, plus `weekly_volume_view` and `personal_bests_view`. Also write `supabase/seed.sql` with a predefined exercise list covering squat/bench/deadlift/press variations and common accessories. Explain the RLS design before I run it.

## Phase 2 — Auth
`/model fable`

> Start Phase 2: set up `@supabase/ssr` client/server helpers (`lib/supabase/client.ts`, `lib/supabase/server.ts`), a `proxy.ts` that refreshes the session and redirects unauthenticated users away from protected routes, and login/signup/logout pages using Server Actions. Walk me through the session-refresh flow before moving on — I want to understand the auth boundary, not just see it work.

## Phase 3 — Workout logging
`/model sonnet`

> Start Phase 3: build the log-workout form (date, exercise picker from the predefined list, dynamic sets with reps/weight/warmup/AMRAP flags) using React Hook Form + Zod, submitting through a Server Action that inserts a workout and its sets. Add unit tests for the Zod schema and a component test for the form's validation states.

## Phase 4 — Routines
`/model sonnet`

> Start Phase 4: let users create, view, and delete reusable routines (name + ordered list of exercises with target sets/reps). Add a way to prefill the Phase 3 workout form from a selected routine. Include a component test for prefill behavior.

## Phase 5 — 5/3/1 program
`/model sonnet`

> Start Phase 5: implement Jim Wendler's 5/3/1 as a seeded routine (`program_type = '531'`) covering squat, bench, deadlift, overhead press. Build the percentage/rep calculator (65/75/85 week 1, 70/80/90 week 2, 75/85/95 week 3 — last set of weeks 1-3 is AMRAP — 40/50/60 deload week 4), a training-max input per lift, and a page that previews computed sets before logging them through the Phase 3 action. Write unit tests for the calculator against Wendler's published percentages, including edge cases (deload week, AMRAP flag placement).

## Phase 6 — History + volume chart
`/model sonnet`

> Start Phase 6: build a sortable/filterable workout history table (date, exercise, reps, weight, volume) and a weekly-volume Recharts chart fed by `weekly_volume_view`. Add a component test for sorting/filtering behavior.

## Phase 7 — Dashboard
`/model sonnet`

> Start Phase 7: build the dashboard — recent workouts, current week's volume, and personal bests sourced from `personal_bests_view` (derived, not stored). Keep data fetching in Server Components.

## Phase 8 — Testing pass
`/model sonnet` (delegate fixture/boilerplate generation to a Haiku subagent if you're using one)

> Start Phase 8: fill any coverage gaps across unit (volume/1RM/531 math), component (forms, table, chart), and e2e (Playwright: signup → log workout → routine → dashboard) tests. Run an accessibility pass with axe on the forms and table. Report current coverage and any gaps you're intentionally leaving.

## Phase 9 — CI/CD & deploy
`/model sonnet`

> Start Phase 9: finish the GitHub Actions workflow to gate merges on lint/typecheck/test/build. Walk me through connecting this repo to Vercel and setting the Supabase env vars in both GitHub Actions secrets and Vercel project settings — I'll do the actual account/dashboard steps myself.

## Phase 10 — Docs
`/model haiku` (or `sonnet` if haiku's output needs polish)

> Start Phase 10: write README.md covering setup, environment variables, running locally, running tests, and deploying. Keep CLAUDE.md's phase checklist in sync — check off completed phases.

---

**Reminders:**
- Run `/cost` before a long session; drop a model tier if you're near a limit (per CLAUDE.md).
- If a prompt's output has a bug, retry once on the same model with a sharper prompt before escalating to Fable 5.
- After Phase 1, create your Supabase project and fill in `.env.local` yourself before continuing to Phase 2 — Claude Code can write the migrations but can't create the cloud project.
