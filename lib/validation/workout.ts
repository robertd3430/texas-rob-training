import { z } from 'zod';

export const workoutSetSchema = z.object({
  reps: z
    .number({ error: 'Reps is required' })
    .int('Reps must be a whole number')
    .min(0, 'Reps cannot be negative')
    .max(100, 'Reps must be 100 or fewer'),
  weight: z
    .number({ error: 'Weight is required' })
    .min(0, 'Weight cannot be negative')
    .max(5000, 'Weight must be 5000 or less'),
  isWarmup: z.boolean(),
  isAmrap: z.boolean(),
});

export const workoutExerciseSchema = z.object({
  exerciseId: z.uuid('Exercise is required'),
  sets: z.array(workoutSetSchema).min(1, 'Add at least one set'),
});

export const logWorkoutSchema = z.object({
  workoutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
    .refine((value) => {
      // Date.parse round-trips invalid calendar dates (e.g. "2026-02-30"
      // becomes March 2), so validate against the UTC components instead.
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    }, 'Enter a valid date'),
  // Set when the log was prefilled from a routine, so the workout row can
  // record its origin (workouts.routine_id). Not user-edited directly.
  routineId: z.uuid().optional(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
  exercises: z.array(workoutExerciseSchema).min(1, 'Add at least one exercise'),
});

export type WorkoutSet = z.infer<typeof workoutSetSchema>;
export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>;
export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;
