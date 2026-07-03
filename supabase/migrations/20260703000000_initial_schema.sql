-- Texas Rob Training — initial schema
-- Tables: exercises, routines, routine_exercises, workouts, workout_sets, training_maxes
-- Views: weekly_volume_view, personal_bests_view (derived, not stored)
-- RLS: enabled on every table; user-owned rows scoped to auth.uid()

-- ============================================================
-- exercises — shared read-only catalog (seeded, no user writes)
-- ============================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('squat', 'bench', 'deadlift', 'press', 'accessory')),
  is_main_lift boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;

-- Catalog is readable by any signed-in user. No insert/update/delete
-- policies exist, so client writes are denied; only service_role
-- (which bypasses RLS) can modify the catalog, e.g. via seed.sql.
create policy "Authenticated users can read exercises"
  on public.exercises for select
  to authenticated
  using (true);

-- ============================================================
-- routines — user-owned templates; program_type marks programs
-- ============================================================
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  program_type text check (program_type in ('531')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.routines enable row level security;

create policy "Users can read own routines"
  on public.routines for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own routines"
  on public.routines for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own routines"
  on public.routines for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own routines"
  on public.routines for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index routines_user_id_idx on public.routines (user_id);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger routines_set_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

-- ============================================================
-- routine_exercises — ordered exercises within a routine
-- Ownership flows through the parent routine.
-- ============================================================
create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  position integer not null check (position >= 1),
  target_sets integer not null check (target_sets between 1 and 20),
  target_reps integer not null check (target_reps between 1 and 100),
  unique (routine_id, position)
);

alter table public.routine_exercises enable row level security;

create policy "Users can read own routine exercises"
  on public.routine_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = (select auth.uid())
    )
  );

create policy "Users can insert own routine exercises"
  on public.routine_exercises for insert
  to authenticated
  with check (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = (select auth.uid())
    )
  );

create policy "Users can update own routine exercises"
  on public.routine_exercises for update
  to authenticated
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own routine exercises"
  on public.routine_exercises for delete
  to authenticated
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = (select auth.uid())
    )
  );

create index routine_exercises_routine_id_idx on public.routine_exercises (routine_id);
create index routine_exercises_exercise_id_idx on public.routine_exercises (exercise_id);

-- ============================================================
-- workouts — one logged session
-- ============================================================
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_date date not null default current_date,
  routine_id uuid references public.routines (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

create policy "Users can read own workouts"
  on public.workouts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own workouts"
  on public.workouts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own workouts"
  on public.workouts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own workouts"
  on public.workouts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index workouts_user_id_date_idx on public.workouts (user_id, workout_date desc);
create index workouts_routine_id_idx on public.workouts (routine_id);

-- ============================================================
-- workout_sets — individual sets; ownership via parent workout
-- ============================================================
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  set_number integer not null check (set_number >= 1),
  reps integer not null check (reps between 0 and 100), -- 0 = failed AMRAP attempt
  weight numeric(6, 2) not null check (weight >= 0),    -- 0 = bodyweight movements
  is_warmup boolean not null default false,
  is_amrap boolean not null default false,
  unique (workout_id, exercise_id, set_number)
);

alter table public.workout_sets enable row level security;

create policy "Users can read own workout sets"
  on public.workout_sets for select
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = (select auth.uid())
    )
  );

create policy "Users can insert own workout sets"
  on public.workout_sets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = (select auth.uid())
    )
  );

create policy "Users can update own workout sets"
  on public.workout_sets for update
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own workout sets"
  on public.workout_sets for delete
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = (select auth.uid())
    )
  );

create index workout_sets_workout_id_idx on public.workout_sets (workout_id);
create index workout_sets_exercise_id_idx on public.workout_sets (exercise_id);

-- ============================================================
-- training_maxes — 5/3/1 TM history per lift; current TM is the
-- row with the latest effective_date (history kept for progression)
-- ============================================================
create table public.training_maxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  weight numeric(6, 2) not null check (weight > 0),
  effective_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, exercise_id, effective_date)
);

alter table public.training_maxes enable row level security;

create policy "Users can read own training maxes"
  on public.training_maxes for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own training maxes"
  on public.training_maxes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own training maxes"
  on public.training_maxes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own training maxes"
  on public.training_maxes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index training_maxes_user_exercise_idx
  on public.training_maxes (user_id, exercise_id, effective_date desc);

-- ============================================================
-- Views — derived, never stored. security_invoker makes the view
-- run with the caller's permissions so the underlying tables' RLS
-- applies; without it the view would run as its owner and leak
-- other users' rows.
-- ============================================================

-- Weekly training volume (working sets only; volume = reps × weight)
create view public.weekly_volume_view
with (security_invoker = true) as
select
  w.user_id,
  date_trunc('week', w.workout_date)::date as week_start,
  sum(s.reps * s.weight) as total_volume,
  count(s.id) as total_sets,
  count(distinct w.id) as workout_count
from public.workouts w
join public.workout_sets s on s.workout_id = w.id
where not s.is_warmup
group by w.user_id, date_trunc('week', w.workout_date);

-- Personal bests: per exercise, the working set with the highest
-- estimated 1RM (Epley: weight × (1 + reps/30)); ties broken by
-- earliest date achieved.
create view public.personal_bests_view
with (security_invoker = true) as
select distinct on (w.user_id, s.exercise_id)
  w.user_id,
  s.exercise_id,
  e.name as exercise_name,
  s.weight,
  s.reps,
  round(s.weight * (1 + s.reps::numeric / 30), 2) as estimated_1rm,
  w.workout_date
from public.workout_sets s
join public.workouts w on w.id = s.workout_id
join public.exercises e on e.id = s.exercise_id
where not s.is_warmup
  and s.reps >= 1
  and s.weight > 0
order by
  w.user_id,
  s.exercise_id,
  s.weight * (1 + s.reps::numeric / 30) desc,
  w.workout_date asc;
