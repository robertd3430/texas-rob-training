import { z } from 'zod';

export const setTrainingMaxSchema = z.object({
  exerciseId: z.uuid('Exercise is required'),
  weight: z
    .number({ error: 'Training max is required' })
    .positive('Training max must be greater than 0')
    .max(2000, 'Training max must be 2000 or less'),
});

export type SetTrainingMaxInput = z.infer<typeof setTrainingMaxSchema>;
