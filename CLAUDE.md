# Texas Rob Training — Working Memory for Claude Code

Next.js weight-training tracker. Stack: Next.js 16 (App Router) + TypeScript strict + Supabase (Postgres + Auth via `@supabase/ssr`) + Tailwind/shadcn/ui + Recharts + Zod/React Hook Form + Vitest/Playwright. Deploy: Vercel + Supabase.
Full detail: `Texas_Rob_Training_Build_Plan.docx` in this folder.

## Principles
- Architecture over speed. Typed everywhere (strict mode). Server Components for initial data. Test every phase before moving on.

## Model guardrails (cost/complexity routing)
- **Default to Sonnet 5** (`/model sonnet`) for implementation: components, forms, Server Actions, routine test-writing, first-pass debugging.
- **Escalate to Fable 5** (`/model fable`) only for: schema/RLS design, auth boundary decisions, a bug that's failed twice on Sonnet, or a refactor spanning many files with non-obvious interactions. Drop back to Sonnet once the decision is made — don't stay on Fable out of inertia.
- **Delegate to Haiku 4.5** (`CLAUDE_CODE_SUBAGENT_MODEL=haiku` or subagent frontmatter `model: haiku`) for: seed data, boilerplate scaffolding, lint/format fixes, README/doc updates, pure repo search.
- Retry once on the cheaper model with a sharper prompt before escalating — most failures are prompt clarity, not model capability.
- Run `/cost` before long sessions; if near a usage limit, drop the default model a tier for that session.

## Phase checklist (work top to bottom; each phase = one mergeable increment with tests)
- [x] 0. Scaffold — `create-next-app`, TS strict, Tailwind, shadcn/ui, ESLint/Prettier/Husky, CI skeleton
- [x] 1. Database — Supabase project, migrations (exercises, routines, routine_exercises, workouts, workout_sets, training_maxes), RLS policies, seed predefined exercises
- [x] 2. Auth — `@supabase/ssr` client/server helpers, `proxy.ts` session refresh, login/signup/logout, protected layout
- [x] 3. Workout logging — log form (date, exercise picker from predefined list, sets/reps/weight), Zod validation, Server Action
- [x] 4. Routines — create/save/edit, apply a routine to prefill a new workout log
- [x] 5. 5/3/1 program — training max input, percentage/rep scheme calc (65/75/85 week 1, 70/80/90 week 2, 75/85/95 week 3, deload week 4; last set of weeks 1-3 is AMRAP), seeded as a routine
- [x] 6. History + volume chart — sortable/filterable table, weekly volume Recharts chart
- [x] 7. Dashboard — recent workouts, current week volume, personal bests (derived, not stored)
- [ ] 8. Tests — unit (volume/1RM/531 math), component (forms, table), e2e (signup → log → dashboard), a11y pass
- [ ] 9. CI/CD — GitHub Actions gate, Vercel + Supabase production env vars, deploy
- [ ] 10. Docs — README (setup/env/run/test/deploy)

## Data model notes
- RLS scoped to `auth.uid()` on every table.
- Personal bests and weekly volume are **views**, not stored columns (`personal_bests_view`, `weekly_volume_view`).
- 5/3/1 is a routine with `program_type = '531'`; percentages are computed at log time from the user's training max, not stored per set.
