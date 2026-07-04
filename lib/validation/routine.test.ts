import { describe, expect, it } from 'vitest';
import { createRoutineSchema, routineExerciseSchema } from './routine';

const EXERCISE_ID = '11111111-1111-4111-8111-111111111111';

const validExercise = { exerciseId: EXERCISE_ID, targetSets: 3, targetReps: 5 };
const validInput = { name: '5/3/1 Squat Day', exercises: [validExercise] };

describe('routineExerciseSchema', () => {
  it('accepts a valid routine exercise', () => {
    expect(routineExerciseSchema.safeParse(validExercise).success).toBe(true);
  });

  it('rejects a non-uuid exercise id', () => {
    expect(routineExerciseSchema.safeParse({ ...validExercise, exerciseId: 'nope' }).success).toBe(
      false,
    );
  });

  it('rejects target sets under 1', () => {
    expect(routineExerciseSchema.safeParse({ ...validExercise, targetSets: 0 }).success).toBe(
      false,
    );
  });

  it('rejects target sets over 20', () => {
    expect(routineExerciseSchema.safeParse({ ...validExercise, targetSets: 21 }).success).toBe(
      false,
    );
  });

  it('rejects non-integer target sets', () => {
    expect(routineExerciseSchema.safeParse({ ...validExercise, targetSets: 2.5 }).success).toBe(
      false,
    );
  });

  it('rejects target reps under 1', () => {
    expect(routineExerciseSchema.safeParse({ ...validExercise, targetReps: 0 }).success).toBe(
      false,
    );
  });

  it('rejects target reps over 100', () => {
    expect(routineExerciseSchema.safeParse({ ...validExercise, targetReps: 101 }).success).toBe(
      false,
    );
  });

  it('accepts the boundary values (1 and their respective maximums)', () => {
    expect(
      routineExerciseSchema.safeParse({ ...validExercise, targetSets: 20, targetReps: 100 })
        .success,
    ).toBe(true);
    expect(
      routineExerciseSchema.safeParse({ ...validExercise, targetSets: 1, targetReps: 1 }).success,
    ).toBe(true);
  });
});

describe('createRoutineSchema', () => {
  it('accepts a fully valid routine', () => {
    expect(createRoutineSchema.safeParse(validInput).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(createRoutineSchema.safeParse({ ...validInput, name: '' }).success).toBe(false);
  });

  it('rejects a name over 100 characters', () => {
    expect(createRoutineSchema.safeParse({ ...validInput, name: 'x'.repeat(101) }).success).toBe(
      false,
    );
  });

  it('rejects an empty exercises array', () => {
    expect(createRoutineSchema.safeParse({ ...validInput, exercises: [] }).success).toBe(false);
  });

  it('accepts multiple exercises', () => {
    const result = createRoutineSchema.safeParse({
      ...validInput,
      exercises: [validExercise, { ...validExercise, targetSets: 1, targetReps: 8 }],
    });
    expect(result.success).toBe(true);
  });
});
