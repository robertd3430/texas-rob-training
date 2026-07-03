import { createClient } from '@/lib/supabase/server';
import { LogWorkoutForm, type RoutineOption } from '@/components/workout/log-workout-form';

export default async function LogWorkoutPage() {
  const supabase = await createClient();

  const [
    { data: exercises, error: exercisesError },
    { data: routines, error: routinesError },
    { data: routineExercises, error: routineExercisesError },
  ] = await Promise.all([
    supabase.from('exercises').select('id, name, category').order('category').order('name'),
    supabase.from('routines').select('id, name').order('name'),
    supabase
      .from('routine_exercises')
      .select('routine_id, exercise_id, position, target_sets, target_reps')
      .order('position'),
  ]);

  if (exercisesError || routinesError || routineExercisesError) {
    const message = (exercisesError ?? routinesError ?? routineExercisesError)?.message;
    throw new Error(`Failed to load log-workout data: ${message}`);
  }

  const exercisesByRoutine = new Map<string, NonNullable<typeof routineExercises>>();
  for (const re of routineExercises ?? []) {
    const list = exercisesByRoutine.get(re.routine_id) ?? [];
    list.push(re);
    exercisesByRoutine.set(re.routine_id, list);
  }

  const routineOptions: RoutineOption[] = (routines ?? []).map((routine) => ({
    id: routine.id,
    name: routine.name,
    exercises: (exercisesByRoutine.get(routine.id) ?? []).map((re) => ({
      exerciseId: re.exercise_id,
      targetSets: re.target_sets,
      targetReps: re.target_reps,
    })),
  }));

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Log workout</h1>
      <LogWorkoutForm exercises={exercises ?? []} routines={routineOptions} />
    </div>
  );
}
