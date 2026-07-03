'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logWorkoutSchema, type LogWorkoutInput } from '@/lib/validation/workout';

export type LogWorkoutResult = { success: true } | { success: false; error: string };

export async function logWorkout(input: LogWorkoutInput): Promise<LogWorkoutResult> {
  const parsed = logWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { workoutDate, routineId, notes, exercises } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to log a workout' };
  }

  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      workout_date: workoutDate,
      notes: notes || null,
      routine_id: routineId || null,
    })
    .select('id')
    .single();

  if (workoutError || !workout) {
    return { success: false, error: workoutError?.message ?? 'Failed to create workout' };
  }

  // set_number restarts at 1 per exercise (matches the workout_sets unique
  // constraint on (workout_id, exercise_id, set_number)).
  const setRows = exercises.flatMap((exercise) =>
    exercise.sets.map((set, index) => ({
      workout_id: workout.id,
      exercise_id: exercise.exerciseId,
      set_number: index + 1,
      reps: set.reps,
      weight: set.weight,
      is_warmup: set.isWarmup,
      is_amrap: set.isAmrap,
    })),
  );

  const { error: setsError } = await supabase.from('workout_sets').insert(setRows);

  if (setsError) {
    // Roll back the orphaned workout row rather than leaving a set-less workout.
    await supabase.from('workouts').delete().eq('id', workout.id);
    return { success: false, error: setsError.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
