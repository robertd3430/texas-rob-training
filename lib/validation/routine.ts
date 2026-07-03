import { z } from 'zod';

export const routineExerciseSchema = z.object({
  exerciseId: z.uuid('Exercise is required'),
  targetSets: z
    .number({ error: 'Target sets is required' })
    .int('Target sets must be a whole number')
    .min(1, 'Target sets must be at least 1')
    .max(20, 'Target sets must be 20 or fewer'),
  targetReps: z
    .number({ error: 'Target reps is required' })
    .int('Target reps must be a whole number')
    .min(1, 'Target reps must be at least 1')
    .max(100, 'Target reps must be 100 or fewer'),
});

export const createRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  exercises: z.array(routineExerciseSchema).min(1, 'Add at least one exercise'),
});

export type RoutineExerciseInput = z.infer<typeof routineExerciseSchema>;
export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
