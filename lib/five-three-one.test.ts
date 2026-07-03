import { describe, expect, it } from 'vitest';
import { computeFiveThreeOneSets, fiveThreeOneScheme, roundToNearest } from './five-three-one';

describe('roundToNearest', () => {
  it('rounds down when under the midpoint', () => {
    expect(roundToNearest(146.25, 5)).toBe(145);
  });

  it('rounds up when at or over the midpoint', () => {
    expect(roundToNearest(168.75, 5)).toBe(170);
    expect(roundToNearest(213.75, 5)).toBe(215);
  });

  it('leaves already-aligned values unchanged', () => {
    expect(roundToNearest(200, 5)).toBe(200);
  });
});

describe('fiveThreeOneScheme', () => {
  it('week 1 is 65/75/85% for 5/5/5+ reps, AMRAP only on the last set', () => {
    const scheme = fiveThreeOneScheme(1);
    expect(scheme).toEqual([
      { setNumber: 1, percentage: 0.65, reps: 5, isAmrap: false },
      { setNumber: 2, percentage: 0.75, reps: 5, isAmrap: false },
      { setNumber: 3, percentage: 0.85, reps: 5, isAmrap: true },
    ]);
  });

  it('week 2 is 70/80/90% for 3/3/3+ reps, AMRAP only on the last set', () => {
    const scheme = fiveThreeOneScheme(2);
    expect(scheme).toEqual([
      { setNumber: 1, percentage: 0.7, reps: 3, isAmrap: false },
      { setNumber: 2, percentage: 0.8, reps: 3, isAmrap: false },
      { setNumber: 3, percentage: 0.9, reps: 3, isAmrap: true },
    ]);
  });

  it('week 3 is 75/85/95% for 5/3/1+ reps, AMRAP only on the last set', () => {
    const scheme = fiveThreeOneScheme(3);
    expect(scheme).toEqual([
      { setNumber: 1, percentage: 0.75, reps: 5, isAmrap: false },
      { setNumber: 2, percentage: 0.85, reps: 3, isAmrap: false },
      { setNumber: 3, percentage: 0.95, reps: 1, isAmrap: true },
    ]);
  });

  it('week 4 (deload) is 40/50/60% for 5/5/5 reps with no AMRAP set', () => {
    const scheme = fiveThreeOneScheme(4);
    expect(scheme).toEqual([
      { setNumber: 1, percentage: 0.4, reps: 5, isAmrap: false },
      { setNumber: 2, percentage: 0.5, reps: 5, isAmrap: false },
      { setNumber: 3, percentage: 0.6, reps: 5, isAmrap: false },
    ]);
    expect(scheme.some((set) => set.isAmrap)).toBe(false);
  });

  it('every non-deload week has exactly one AMRAP set, on the last set', () => {
    for (const week of [1, 2, 3] as const) {
      const scheme = fiveThreeOneScheme(week);
      const amrapIndices = scheme.flatMap((set, index) => (set.isAmrap ? [index] : []));
      expect(amrapIndices).toEqual([scheme.length - 1]);
    }
  });
});

describe('computeFiveThreeOneSets', () => {
  it('matches Wendler’s published percentage table for a 200 lb training max', () => {
    expect(computeFiveThreeOneSets(200, 1).map((s) => s.weight)).toEqual([130, 150, 170]);
    expect(computeFiveThreeOneSets(200, 2).map((s) => s.weight)).toEqual([140, 160, 180]);
    expect(computeFiveThreeOneSets(200, 3).map((s) => s.weight)).toEqual([150, 170, 190]);
    expect(computeFiveThreeOneSets(200, 4).map((s) => s.weight)).toEqual([80, 100, 120]);
  });

  it('matches the published table for a 225 lb training max, including rounding', () => {
    expect(computeFiveThreeOneSets(225, 1).map((s) => s.weight)).toEqual([145, 170, 190]);
    expect(computeFiveThreeOneSets(225, 2).map((s) => s.weight)).toEqual([160, 180, 205]);
    expect(computeFiveThreeOneSets(225, 3).map((s) => s.weight)).toEqual([170, 190, 215]);
    expect(computeFiveThreeOneSets(225, 4).map((s) => s.weight)).toEqual([90, 115, 135]);
  });

  it('carries reps and the AMRAP flag through onto each computed set', () => {
    const sets = computeFiveThreeOneSets(200, 1);
    expect(sets).toEqual([
      { setNumber: 1, percentage: 0.65, reps: 5, isAmrap: false, weight: 130 },
      { setNumber: 2, percentage: 0.75, reps: 5, isAmrap: false, weight: 150 },
      { setNumber: 3, percentage: 0.85, reps: 5, isAmrap: true, weight: 170 },
    ]);
  });

  it('deload week never sets isAmrap regardless of training max', () => {
    const sets = computeFiveThreeOneSets(315, 4);
    expect(sets.every((set) => !set.isAmrap)).toBe(true);
  });

  it('supports a different rounding increment (e.g. 2.5 for kg plates)', () => {
    expect(computeFiveThreeOneSets(100, 1, 2.5).map((s) => s.weight)).toEqual([65, 75, 85]);
  });

  it('produces all-zero weights for a zero training max without throwing', () => {
    expect(computeFiveThreeOneSets(0, 1).map((s) => s.weight)).toEqual([0, 0, 0]);
  });

  it('scales linearly with training max at a fixed week', () => {
    const base = computeFiveThreeOneSets(100, 2);
    const doubled = computeFiveThreeOneSets(200, 2);
    base.forEach((set, index) => {
      expect(doubled[index].weight).toBe(set.weight * 2);
    });
  });
});
