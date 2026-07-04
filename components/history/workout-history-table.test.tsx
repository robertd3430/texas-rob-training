import { axe } from 'jest-axe';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkoutHistoryTable, type HistoryRow } from './workout-history-table';

const rows: HistoryRow[] = [
  { id: '1', date: '2026-06-01', exerciseName: 'Back Squat', reps: 5, weight: 225, volume: 1125 },
  { id: '2', date: '2026-06-08', exerciseName: 'Bench Press', reps: 8, weight: 135, volume: 1080 },
  { id: '3', date: '2026-06-15', exerciseName: 'Back Squat', reps: 3, weight: 245, volume: 735 },
  { id: '4', date: '2026-06-22', exerciseName: 'Deadlift', reps: 1, weight: 315, volume: 315 },
];

function dataRows() {
  return screen.getAllByRole('row').slice(1);
}

function cellsOf(row: HTMLElement) {
  return within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent);
}

describe('WorkoutHistoryTable', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<WorkoutHistoryTable rows={rows} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders every row with the requested columns', () => {
    render(<WorkoutHistoryTable rows={rows} />);

    expect(screen.getByRole('button', { name: /sort by date/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort by exercise/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort by reps/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort by weight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort by volume/i })).toBeInTheDocument();
    expect(dataRows()).toHaveLength(4);
  });

  it('defaults to sorting by date descending (most recent first)', () => {
    render(<WorkoutHistoryTable rows={rows} />);

    const dates = dataRows().map((row) => cellsOf(row)[0]);
    expect(dates).toEqual(['2026-06-22', '2026-06-15', '2026-06-08', '2026-06-01']);
  });

  it('sorts numerically by weight, ascending then descending on repeated clicks', async () => {
    const user = userEvent.setup();
    render(<WorkoutHistoryTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: /sort by weight/i }));
    let weights = dataRows().map((row) => cellsOf(row)[3]);
    expect(weights).toEqual(['135', '225', '245', '315']);

    await user.click(screen.getByRole('button', { name: /sort by weight/i }));
    weights = dataRows().map((row) => cellsOf(row)[3]);
    expect(weights).toEqual(['315', '245', '225', '135']);
  });

  it('sorts alphabetically by exercise name', async () => {
    const user = userEvent.setup();
    render(<WorkoutHistoryTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: /sort by exercise/i }));
    const exercises = dataRows().map((row) => cellsOf(row)[1]);
    expect(exercises).toEqual(['Back Squat', 'Back Squat', 'Bench Press', 'Deadlift']);
  });

  it('sorts numerically by volume', async () => {
    const user = userEvent.setup();
    render(<WorkoutHistoryTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: /sort by volume/i }));
    const volumes = dataRows().map((row) => cellsOf(row)[4]);
    expect(volumes).toEqual(['315', '735', '1080', '1125']);
  });

  it('filters to a single exercise via the exercise picker', async () => {
    const user = userEvent.setup();
    render(<WorkoutHistoryTable rows={rows} />);

    await user.click(screen.getByRole('combobox', { name: /exercise/i }));
    await user.click(await screen.findByRole('option', { name: 'Back Squat' }));

    const filtered = dataRows();
    expect(filtered).toHaveLength(2);
    filtered.forEach((row) => expect(cellsOf(row)[1]).toBe('Back Squat'));
  });

  it('keeps the active sort applied after filtering', async () => {
    const user = userEvent.setup();
    render(<WorkoutHistoryTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: /sort by weight/i }));
    await user.click(screen.getByRole('combobox', { name: /exercise/i }));
    await user.click(await screen.findByRole('option', { name: 'Back Squat' }));

    const weights = dataRows().map((row) => cellsOf(row)[3]);
    expect(weights).toEqual(['225', '245']);
  });

  it('returns to the full list when the filter is reset to "All exercises"', async () => {
    const user = userEvent.setup();
    render(<WorkoutHistoryTable rows={rows} />);

    await user.click(screen.getByRole('combobox', { name: /exercise/i }));
    await user.click(await screen.findByRole('option', { name: 'Deadlift' }));
    expect(dataRows()).toHaveLength(1);

    await user.click(screen.getByRole('combobox', { name: /exercise/i }));
    await user.click(await screen.findByRole('option', { name: 'All exercises' }));
    expect(dataRows()).toHaveLength(4);
  });

  it('shows an empty state when there are no rows', () => {
    render(<WorkoutHistoryTable rows={[]} />);
    expect(screen.getByText(/no sets logged yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
