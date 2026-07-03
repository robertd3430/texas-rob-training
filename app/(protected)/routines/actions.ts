'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createRoutineSchema, type CreateRoutineInput } from '@/lib/validation/routine';

export type CreateRoutineResult = { success: true } | { success: false; error: string };

export async function createRoutine(input: CreateRoutineInput): Promise<CreateRoutineResult> {
  const parsed = createRoutineSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { name, exercises } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to create a routine' };
  }

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ user_id: user.id, name })
    .select('id')
    .single();

  if (routineError || !routine) {
    return { success: false, error: routineError?.message ?? 'Failed to create routine' };
  }

  const { error: exercisesError } = await supabase.from('routine_exercises').insert(
    exercises.map((exercise, index) => ({
      routine_id: routine.id,
      exercise_id: exercise.exerciseId,
      position: index + 1,
      target_sets: exercise.targetSets,
      target_reps: exercise.targetReps,
    })),
  );

  if (exercisesError) {
    // Roll back the orphaned routine row rather than leaving one with no exercises.
    await supabase.from('routines').delete().eq('id', routine.id);
    return { success: false, error: exercisesError.message };
  }

  revalidatePath('/routines');
  revalidatePath('/log');
  return { success: true };
}

export async function deleteRoutine(routineId: string) {
  const supabase = await createClient();
  await supabase.from('routines').delete().eq('id', routineId);
  revalidatePath('/routines');
  revalidatePath('/log');
}
