import { createClient } from '@/lib/supabase/server';
import { WeeklyVolumeChart } from '@/components/history/weekly-volume-chart';
import { WorkoutHistoryTable, type HistoryRow } from '@/components/history/workout-history-table';

export default async function HistoryPage() {
  const supabase = await createClient();

  const [{ data: sets, error: setsError }, { data: weeklyVolume, error: volumeError }] =
    await Promise.all([
      supabase
        .from('workout_sets')
        .select('id, reps, weight, exercises!inner(name), workouts!inner(workout_date)'),
      supabase
        .from('weekly_volume_view')
        .select('week_start, total_volume')
        .order('week_start', { ascending: true }),
    ]);

  if (setsError || volumeError) {
    throw new Error(`Failed to load history: ${(setsError ?? volumeError)?.message}`);
  }

  const rows: HistoryRow[] = (sets ?? []).map((set) => ({
    id: set.id,
    date: set.workouts.workout_date,
    exerciseName: set.exercises.name,
    reps: set.reps,
    weight: set.weight,
    volume: set.reps * set.weight,
  }));

  const weeklyVolumeData = (weeklyVolume ?? [])
    .filter((week) => week.week_start !== null && week.total_volume !== null)
    .map((week) => ({
      weekStart: week.week_start as string,
      totalVolume: week.total_volume as number,
    }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold">Weekly volume</h1>
        <WeeklyVolumeChart data={weeklyVolumeData} />
      </div>
      <div>
        <h1 className="mb-4 text-xl font-semibold">History</h1>
        <WorkoutHistoryTable rows={rows} />
      </div>
    </div>
  );
}
