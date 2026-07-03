'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { setTrainingMaxSchema, type SetTrainingMaxInput } from '@/lib/validation/training-max';

export type SetTrainingMaxResult = { success: true } | { success: false; error: string };

export async function setTrainingMax(input: SetTrainingMaxInput): Promise<SetTrainingMaxResult> {
  const parsed = setTrainingMaxSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { exerciseId, weight } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to set a training max' };
  }

  // Re-saving the same day updates that day's row; a new day starts a new
  // historical entry, which is how training_maxes tracks TM progression.
  const { error } = await supabase.from('training_maxes').upsert(
    {
      user_id: user.id,
      exercise_id: exerciseId,
      weight,
      effective_date: new Date().toISOString().slice(0, 10),
    },
    { onConflict: 'user_id,exercise_id,effective_date' },
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/531');
  return { success: true };
}

const FIVE_THREE_ONE_ROUTINE_NAME = '5/3/1';
const FIVE_THREE_ONE_NOMINAL_SETS = 3;
const FIVE_THREE_ONE_NOMINAL_REPS = 5;

export type GetOrCreateRoutineResult =
  { success: true; routineId: string } | { success: false; error: string };

// The 531 program is represented as a routine (program_type = '531') so
// logged sessions can reference it via workouts.routine_id, same as any
// other routine. Unlike Phase 4 routines, its routine_exercises rows are
// nominal placeholders — actual sets/weights are computed at log time from
// the user's training max, not read from target_sets/target_reps.
export async function getOrCreateFiveThreeOneRoutineId(): Promise<GetOrCreateRoutineResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in' };
  }

  const { data: existing, error: findError } = await supabase
    .from('routines')
    .select('id')
    .eq('program_type', '531')
    .limit(1)
    .maybeSingle();

  if (findError) {
    return { success: false, error: findError.message };
  }
  if (existing) {
    return { success: true, routineId: existing.id };
  }

  const { data: mainLifts, error: liftsError } = await supabase
    .from('exercises')
    .select('id')
    .eq('is_main_lift', true);

  if (liftsError) {
    return { success: false, error: liftsError.message };
  }

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ user_id: user.id, name: FIVE_THREE_ONE_ROUTINE_NAME, program_type: '531' })
    .select('id')
    .single();

  if (routineError || !routine) {
    return { success: false, error: routineError?.message ?? 'Failed to create routine' };
  }

  if (mainLifts && mainLifts.length > 0) {
    const { error: exercisesError } = await supabase.from('routine_exercises').insert(
      mainLifts.map((lift, index) => ({
        routine_id: routine.id,
        exercise_id: lift.id,
        position: index + 1,
        target_sets: FIVE_THREE_ONE_NOMINAL_SETS,
        target_reps: FIVE_THREE_ONE_NOMINAL_REPS,
      })),
    );

    if (exercisesError) {
      await supabase.from('routines').delete().eq('id', routine.id);
      return { success: false, error: exercisesError.message };
    }
  }

  revalidatePath('/routines');
  return { success: true, routineId: routine.id };
}
