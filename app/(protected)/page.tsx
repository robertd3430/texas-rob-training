import { createClient } from '@/lib/supabase/server';
import {
  RecentWorkoutsCard,
  type RecentWorkout,
} from '@/components/dashboard/recent-workouts-card';
import {
  CurrentWeekVolumeCard,
  type CurrentWeekVolume,
} from '@/components/dashboard/current-week-volume-card';
import { PersonalBestsCard, type PersonalBest } from '@/components/dashboard/personal-bests-card';

const RECENT_WORKOUTS_LIMIT = 5;

// Matches Postgres date_trunc('week', ...), which truncates to the Monday
// of the current ISO week — so week_start rows can be looked up directly.
function currentWeekStart(): string {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  return monday.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: workouts, error: workoutsError },
    { data: weekVolume, error: weekVolumeError },
    { data: personalBests, error: personalBestsError },
  ] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, workout_date, routines(name)')
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(RECENT_WORKOUTS_LIMIT),
    supabase
      .from('weekly_volume_view')
      .select('total_volume, total_sets, workout_count')
      .eq('week_start', currentWeekStart())
      .maybeSingle(),
    supabase
      .from('personal_bests_view')
      .select('exercise_id, exercise_name, weight, reps, estimated_1rm, workout_date')
      .order('exercise_name', { ascending: true }),
  ]);

  if (workoutsError || weekVolumeError || personalBestsError) {
    throw new Error(
      `Failed to load dashboard: ${(workoutsError ?? weekVolumeError ?? personalBestsError)?.message}`,
    );
  }

  const workoutIds = (workouts ?? []).map((workout) => workout.id);

  const { data: sets, error: setsError } =
    workoutIds.length > 0
      ? await supabase
          .from('workout_sets')
          .select('workout_id, exercises(name)')
          .in('workout_id', workoutIds)
      : { data: [], error: null };

  if (setsError) {
    throw new Error(`Failed to load dashboard: ${setsError.message}`);
  }

  const exerciseNamesByWorkout = new Map<string, string[]>();
  const setCountByWorkout = new Map<string, number>();
  for (const set of sets ?? []) {
    setCountByWorkout.set(set.workout_id, (setCountByWorkout.get(set.workout_id) ?? 0) + 1);
    const names = exerciseNamesByWorkout.get(set.workout_id) ?? [];
    if (set.exercises?.name && !names.includes(set.exercises.name)) {
      names.push(set.exercises.name);
    }
    exerciseNamesByWorkout.set(set.workout_id, names);
  }

  const recentWorkouts: RecentWorkout[] = (workouts ?? []).map((workout) => ({
    id: workout.id,
    date: workout.workout_date,
    routineName: workout.routines?.name ?? null,
    exerciseNames: exerciseNamesByWorkout.get(workout.id) ?? [],
    totalSets: setCountByWorkout.get(workout.id) ?? 0,
  }));

  const weekVolumeData: CurrentWeekVolume = weekVolume
    ? {
        totalVolume: weekVolume.total_volume ?? 0,
        totalSets: weekVolume.total_sets ?? 0,
        workoutCount: weekVolume.workout_count ?? 0,
      }
    : null;

  const personalBestRows: PersonalBest[] = (personalBests ?? [])
    .filter(
      (
        best,
      ): best is typeof best & {
        exercise_id: string;
        exercise_name: string;
        weight: number;
        reps: number;
        estimated_1rm: number;
        workout_date: string;
      } => best.exercise_id !== null,
    )
    .map((best) => ({
      exerciseId: best.exercise_id,
      exerciseName: best.exercise_name,
      weight: best.weight,
      reps: best.reps,
      estimated1RM: best.estimated_1rm,
      date: best.workout_date,
    }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">Welcome back</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrentWeekVolumeCard data={weekVolumeData} />
        <RecentWorkoutsCard workouts={recentWorkouts} />
      </div>
      <PersonalBestsCard bests={personalBestRows} />
    </div>
  );
}
