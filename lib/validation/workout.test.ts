import { describe, expect, it } from 'vitest';
import { logWorkoutSchema, workoutExerciseSchema, workoutSetSchema } from './workout';

const SQUAT_ID = '11111111-1111-4111-8111-111111111111';
const BENCH_ID = '22222222-2222-4222-8222-222222222222';
const ROUTINE_ID = '33333333-3333-4333-8333-333333333333';

const validSet = { reps: 5, weight: 135, isWarmup: false, isAmrap: false };
const validExercise = { exerciseId: SQUAT_ID, sets: [validSet] };

const validInput = {
  workoutDate: '2026-07-03',
  notes: 'Felt strong',
  exercises: [validExercise],
};

describe('workoutSetSchema', () => {
  it('accepts a valid working set', () => {
    expect(workoutSetSchema.safeParse(validSet).success).toBe(true);
  });

  it('rejects negative reps', () => {
    const result = workoutSetSchema.safeParse({ ...validSet, reps: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer reps', () => {
    const result = workoutSetSchema.safeParse({ ...validSet, reps: 5.5 });
    expect(result.success).toBe(false);
  });

  it('rejects reps over 100', () => {
    const result = workoutSetSchema.safeParse({ ...validSet, reps: 101 });
    expect(result.success).toBe(false);
  });

  it('accepts zero reps (failed AMRAP attempt)', () => {
    expect(workoutSetSchema.safeParse({ ...validSet, reps: 0 }).success).toBe(true);
  });

  it('rejects negative weight', () => {
    const result = workoutSetSchema.safeParse({ ...validSet, weight: -5 });
    expect(result.success).toBe(false);
  });

  it('accepts zero weight (bodyweight movement)', () => {
    expect(workoutSetSchema.safeParse({ ...validSet, weight: 0 }).success).toBe(true);
  });

  it('rejects weight over the 5000 ceiling', () => {
    const result = workoutSetSchema.safeParse({ ...validSet, weight: 5001 });
    expect(result.success).toBe(false);
  });

  it('requires isWarmup and isAmrap to be booleans', () => {
    const result = workoutSetSchema.safeParse({ ...validSet, isWarmup: 'yes' });
    expect(result.success).toBe(false);
  });
});

describe('workoutExerciseSchema', () => {
  it('accepts a valid exercise with sets', () => {
    expect(workoutExerciseSchema.safeParse(validExercise).success).toBe(true);
  });

  it('rejects an empty sets array', () => {
    const result = workoutExerciseSchema.safeParse({ ...validExercise, sets: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a non-uuid exercise id', () => {
    const result = workoutExerciseSchema.safeParse({ ...validExercise, exerciseId: 'nope' });
    expect(result.success).toBe(false);
  });
});

describe('logWorkoutSchema', () => {
  it('accepts a fully valid workout log', () => {
    expect(logWorkoutSchema.safeParse(validInput).success).toBe(true);
  });

  it('accepts an omitted notes field', () => {
    const { workoutDate, exercises } = validInput;
    expect(logWorkoutSchema.safeParse({ workoutDate, exercises }).success).toBe(true);
  });

  it('accepts an omitted routineId (manual log, not from a routine)', () => {
    expect(logWorkoutSchema.safeParse(validInput).success).toBe(true);
  });

  it('accepts a valid routineId', () => {
    const result = logWorkoutSchema.safeParse({ ...validInput, routineId: ROUTINE_ID });
    expect(result.success).toBe(true);
  });

  it('rejects a non-uuid routineId', () => {
    const result = logWorkoutSchema.safeParse({ ...validInput, routineId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed workout date', () => {
    const result = logWorkoutSchema.safeParse({ ...validInput, workoutDate: '07/03/2026' });
    expect(result.success).toBe(false);
  });

  it('rejects a syntactically valid but impossible date', () => {
    const result = logWorkoutSchema.safeParse({ ...validInput, workoutDate: '2026-02-30' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty exercises array', () => {
    const result = logWorkoutSchema.safeParse({ ...validInput, exercises: [] });
    expect(result.success).toBe(false);
  });

  it('rejects an exercise with a missing exercise id', () => {
    const result = logWorkoutSchema.safeParse({
      ...validInput,
      exercises: [{ ...validExercise, exerciseId: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes over 1000 characters', () => {
    const result = logWorkoutSchema.safeParse({ ...validInput, notes: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  it('propagates a per-set error with its exercise and set index in the path', () => {
    const result = logWorkoutSchema.safeParse({
      ...validInput,
      exercises: [validExercise, { exerciseId: BENCH_ID, sets: [{ ...validSet, reps: -1 }] }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['exercises', 1, 'sets', 0, 'reps']);
    }
  });

  it('accepts multiple exercises, each with multiple sets and mixed warmup/amrap flags', () => {
    const result = logWorkoutSchema.safeParse({
      ...validInput,
      exercises: [
        {
          exerciseId: SQUAT_ID,
          sets: [
            { reps: 8, weight: 95, isWarmup: true, isAmrap: false },
            { reps: 5, weight: 135, isWarmup: false, isAmrap: false },
            { reps: 12, weight: 135, isWarmup: false, isAmrap: true },
          ],
        },
        {
          exerciseId: BENCH_ID,
          sets: [{ reps: 5, weight: 185, isWarmup: false, isAmrap: false }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
