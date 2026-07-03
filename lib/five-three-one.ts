export type FiveThreeOneWeek = 1 | 2 | 3 | 4;

export type FiveThreeOneSetScheme = {
  setNumber: number;
  percentage: number;
  reps: number;
  isAmrap: boolean;
};

export type ComputedSet = FiveThreeOneSetScheme & { weight: number };

// Jim Wendler's 5/3/1: weeks 1-3 work up to a top set taken for max reps
// (AMRAP); week 4 is a deload with no AMRAP set.
const WEEK_SCHEMES: Record<FiveThreeOneWeek, readonly Omit<FiveThreeOneSetScheme, 'setNumber'>[]> =
  {
    1: [
      { percentage: 0.65, reps: 5, isAmrap: false },
      { percentage: 0.75, reps: 5, isAmrap: false },
      { percentage: 0.85, reps: 5, isAmrap: true },
    ],
    2: [
      { percentage: 0.7, reps: 3, isAmrap: false },
      { percentage: 0.8, reps: 3, isAmrap: false },
      { percentage: 0.9, reps: 3, isAmrap: true },
    ],
    3: [
      { percentage: 0.75, reps: 5, isAmrap: false },
      { percentage: 0.85, reps: 3, isAmrap: false },
      { percentage: 0.95, reps: 1, isAmrap: true },
    ],
    4: [
      { percentage: 0.4, reps: 5, isAmrap: false },
      { percentage: 0.5, reps: 5, isAmrap: false },
      { percentage: 0.6, reps: 5, isAmrap: false },
    ],
  };

export function fiveThreeOneScheme(week: FiveThreeOneWeek): FiveThreeOneSetScheme[] {
  return WEEK_SCHEMES[week].map((set, index) => ({ ...set, setNumber: index + 1 }));
}

export function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function computeFiveThreeOneSets(
  trainingMax: number,
  week: FiveThreeOneWeek,
  roundingIncrement = 5,
): ComputedSet[] {
  return fiveThreeOneScheme(week).map((set) => ({
    ...set,
    weight: roundToNearest(trainingMax * set.percentage, roundingIncrement),
  }));
}
