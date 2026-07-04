import { axe } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecentWorkoutsCard, type RecentWorkout } from './recent-workouts-card';

const workouts: RecentWorkout[] = [
  {
    id: '1',
    date: '2026-06-22',
    routineName: '5/3/1 Squat Day',
    exerciseNames: ['Back Squat', 'Deadlift'],
    totalSets: 5,
  },
  {
    id: '2',
    date: '2026-06-15',
    routineName: null,
    exerciseNames: [],
    totalSets: 0,
  },
];

describe('RecentWorkoutsCard', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<RecentWorkoutsCard workouts={workouts} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows an empty state when there are no workouts', () => {
    render(<RecentWorkoutsCard workouts={[]} />);
    expect(screen.getByText(/no workouts logged yet/i)).toBeInTheDocument();
  });

  it('renders the routine name and exercises for a workout logged from a routine', () => {
    render(<RecentWorkoutsCard workouts={workouts} />);
    expect(screen.getByText(/5\/3\/1 Squat Day — Back Squat, Deadlift/)).toBeInTheDocument();
    expect(screen.getByText('5 sets')).toBeInTheDocument();
  });

  it('falls back to "No sets logged" for a workout with no sets and no routine', () => {
    render(<RecentWorkoutsCard workouts={workouts} />);
    expect(screen.getByText('No sets logged')).toBeInTheDocument();
    expect(screen.getByText('0 sets')).toBeInTheDocument();
  });
});
