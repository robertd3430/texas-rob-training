import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeeklyVolumeChart, type WeeklyVolumePoint } from './weekly-volume-chart';

const data: WeeklyVolumePoint[] = [
  { weekStart: '2026-06-01', totalVolume: 4500 },
  { weekStart: '2026-06-08', totalVolume: 5200 },
];

describe('WeeklyVolumeChart', () => {
  beforeEach(() => {
    // jsdom has no layout engine, so recharts' ResponsiveContainer measures
    // a 0x0 box via getBoundingClientRect and refuses to render children.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 500,
      height: 300,
      top: 0,
      left: 0,
      right: 500,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON() {},
    });
  });

  it('shows an empty state when there is no data', () => {
    render(<WeeklyVolumeChart data={[]} />);
    expect(screen.getByText(/no workouts logged yet/i)).toBeInTheDocument();
  });

  it('renders a bar chart with one bar per data point', () => {
    const { container } = render(<WeeklyVolumeChart data={data} />);
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(data.length);
  });
});
