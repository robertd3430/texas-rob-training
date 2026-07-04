import { axe } from 'jest-axe';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PersonalBestsCard, type PersonalBest } from './personal-bests-card';

const bests: PersonalBest[] = [
  {
    exerciseId: '1',
    exerciseName: 'Back Squat',
    weight: 315,
    reps: 3,
    estimated1RM: 346.5,
    date: '2026-06-01',
  },
  {
    exerciseId: '2',
    exerciseName: 'Bench Press',
    weight: 225,
    reps: 1,
    estimated1RM: 232.5,
    date: '2026-06-08',
  },
];

function dataRows() {
  return screen.getAllByRole('row').slice(1);
}

describe('PersonalBestsCard', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<PersonalBestsCard bests={bests} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows an empty state when there are no personal bests', () => {
    render(<PersonalBestsCard bests={[]} />);
    expect(screen.getByText(/no personal bests yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders one row per exercise with the best set and estimated 1RM', () => {
    render(<PersonalBestsCard bests={bests} />);
    const rows = dataRows();
    expect(rows).toHaveLength(2);
    const firstCells = within(rows[0])
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    expect(firstCells).toEqual(['Back Squat', '315 × 3', '346.5 lb']);
  });
});
