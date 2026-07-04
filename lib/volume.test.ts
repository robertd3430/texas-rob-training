import { describe, expect, it } from 'vitest';
import { computeSetVolume } from './volume';

describe('computeSetVolume', () => {
  it('multiplies reps by weight', () => {
    expect(computeSetVolume(5, 225)).toBe(1125);
  });

  it('handles fractional plate weights', () => {
    expect(computeSetVolume(8, 135.5)).toBe(1084);
  });

  it('is zero for a failed AMRAP attempt (0 reps)', () => {
    expect(computeSetVolume(0, 225)).toBe(0);
  });

  it('is zero for bodyweight movements (0 weight)', () => {
    expect(computeSetVolume(12, 0)).toBe(0);
  });
});
