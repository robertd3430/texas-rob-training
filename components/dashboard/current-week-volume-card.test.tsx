import { axe } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrentWeekVolumeCard } from './current-week-volume-card';

describe('CurrentWeekVolumeCard', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <CurrentWeekVolumeCard data={{ totalVolume: 12500, totalSets: 20, workoutCount: 3 }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows an empty state when there is no data for the week', () => {
    render(<CurrentWeekVolumeCard data={null} />);
    expect(screen.getByText(/no workouts logged this week/i)).toBeInTheDocument();
  });

  it('renders the volume, sets, and workout count', () => {
    render(<CurrentWeekVolumeCard data={{ totalVolume: 12500, totalSets: 20, workoutCount: 3 }} />);
    expect(screen.getByText('12,500 lb')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
