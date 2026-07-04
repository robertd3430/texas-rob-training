import { describe, expect, it } from 'vitest';
import { setTrainingMaxSchema } from './training-max';

const EXERCISE_ID = '11111111-1111-4111-8111-111111111111';

describe('setTrainingMaxSchema', () => {
  it('accepts a valid training max', () => {
    expect(setTrainingMaxSchema.safeParse({ exerciseId: EXERCISE_ID, weight: 225 }).success).toBe(
      true,
    );
  });

  it('rejects a non-uuid exercise id', () => {
    expect(setTrainingMaxSchema.safeParse({ exerciseId: 'nope', weight: 225 }).success).toBe(false);
  });

  it('rejects a zero weight', () => {
    expect(setTrainingMaxSchema.safeParse({ exerciseId: EXERCISE_ID, weight: 0 }).success).toBe(
      false,
    );
  });

  it('rejects a negative weight', () => {
    expect(setTrainingMaxSchema.safeParse({ exerciseId: EXERCISE_ID, weight: -5 }).success).toBe(
      false,
    );
  });

  it('rejects weight over the 2000 ceiling', () => {
    expect(setTrainingMaxSchema.safeParse({ exerciseId: EXERCISE_ID, weight: 2001 }).success).toBe(
      false,
    );
  });

  it('accepts the 2000 boundary', () => {
    expect(setTrainingMaxSchema.safeParse({ exerciseId: EXERCISE_ID, weight: 2000 }).success).toBe(
      true,
    );
  });
});
