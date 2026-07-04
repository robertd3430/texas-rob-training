import { axe } from 'jest-axe';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FiveThreeOneForm, type MainLift } from './five-three-one-form';
import { getOrCreateFiveThreeOneRoutineId, setTrainingMax } from '@/app/(protected)/531/actions';
import { logWorkout } from '@/app/(protected)/log/actions';

vi.mock('@/app/(protected)/531/actions', () => ({
  setTrainingMax: vi.fn(),
  getOrCreateFiveThreeOneRoutineId: vi.fn(),
}));
vi.mock('@/app/(protected)/log/actions', () => ({
  logWorkout: vi.fn(),
}));

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockedSetTrainingMax = vi.mocked(setTrainingMax);
const mockedGetOrCreateRoutine = vi.mocked(getOrCreateFiveThreeOneRoutineId);
const mockedLogWorkout = vi.mocked(logWorkout);

const SQUAT_ID = '11111111-1111-4111-8111-111111111111';
const BENCH_ID = '22222222-2222-4222-8222-222222222222';

const mainLifts: MainLift[] = [
  { id: SQUAT_ID, name: 'Back Squat', category: 'squat' },
  { id: BENCH_ID, name: 'Bench Press', category: 'bench' },
];

function dataRows() {
  return screen.getAllByRole('row').slice(1);
}

async function enterTrainingMax(user: ReturnType<typeof userEvent.setup>, weight: string) {
  const input = screen.getByLabelText('Back Squat');
  await user.clear(input);
  await user.type(input, weight);
}

describe('FiveThreeOneForm', () => {
  beforeEach(() => {
    mockedSetTrainingMax.mockReset();
    mockedGetOrCreateRoutine.mockReset();
    mockedLogWorkout.mockReset();
    mockRefresh.mockReset();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{ [SQUAT_ID]: 200 }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows a hint instead of the preview when the selected lift has no training max', () => {
    render(<FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{}} />);

    expect(screen.getByText(/enter and save a training max/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log workout/i })).toBeDisabled();
  });

  it('previews week 1 computed sets as soon as a training max is typed in', async () => {
    const user = userEvent.setup();
    render(<FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{}} />);

    await enterTrainingMax(user, '200');

    const weights = dataRows().map((row) => rowCell(row, 2).textContent);
    expect(weights).toEqual(['130', '150', '170']);
    expect(screen.getByRole('button', { name: /log workout/i })).toBeEnabled();
  });

  it('recomputes the preview when a different week is selected', async () => {
    const user = userEvent.setup();
    render(<FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{}} />);

    await enterTrainingMax(user, '200');
    await user.click(screen.getByRole('combobox', { name: /^week$/i }));
    await user.click(await screen.findByRole('option', { name: 'Week 3' }));

    const weights = dataRows().map((row) => rowCell(row, 2).textContent);
    expect(weights).toEqual(['150', '170', '190']);
  });

  it('saves training maxes only for lifts with a non-zero value, then refreshes', async () => {
    mockedSetTrainingMax.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{}} />);

    await enterTrainingMax(user, '200');
    await user.click(screen.getByRole('button', { name: /save training maxes/i }));

    await waitFor(() => expect(mockedSetTrainingMax).toHaveBeenCalledTimes(1));
    expect(mockedSetTrainingMax).toHaveBeenCalledWith({ exerciseId: SQUAT_ID, weight: 200 });
    expect(await screen.findByRole('status')).toHaveTextContent(/training maxes saved/i);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows the server error when saving a training max fails', async () => {
    mockedSetTrainingMax.mockResolvedValue({ success: false, error: 'Weight too high' });
    const user = userEvent.setup();
    render(<FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{}} />);

    await enterTrainingMax(user, '200');
    await user.click(screen.getByRole('button', { name: /save training maxes/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/weight too high/i);
  });

  it('logs a workout with the computed sets for the selected lift and week', async () => {
    mockedGetOrCreateRoutine.mockResolvedValue({ success: true, routineId: 'routine-1' });
    mockedLogWorkout.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{}} />);

    await enterTrainingMax(user, '200');
    await user.click(screen.getByRole('button', { name: /log workout/i }));

    await waitFor(() => expect(mockedLogWorkout).toHaveBeenCalledTimes(1));
    const submitted = mockedLogWorkout.mock.calls[0][0];
    expect(submitted.routineId).toBe('routine-1');
    expect(submitted.exercises).toEqual([
      {
        exerciseId: SQUAT_ID,
        sets: [
          { reps: 5, weight: 130, isWarmup: false, isAmrap: false },
          { reps: 5, weight: 150, isWarmup: false, isAmrap: false },
          { reps: 5, weight: 170, isWarmup: false, isAmrap: true },
        ],
      },
    ]);
    expect(await screen.findByRole('status')).toHaveTextContent(/workout logged/i);
  });

  it('shows an error and does not log a workout when the routine lookup fails', async () => {
    mockedGetOrCreateRoutine.mockResolvedValue({ success: false, error: 'No routine' });
    const user = userEvent.setup();
    render(<FiveThreeOneForm mainLifts={mainLifts} trainingMaxes={{}} />);

    await enterTrainingMax(user, '200');
    await user.click(screen.getByRole('button', { name: /log workout/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no routine/i);
    expect(mockedLogWorkout).not.toHaveBeenCalled();
  });
});

function rowCell(row: HTMLElement, index: number) {
  return within(row).getAllByRole('cell')[index];
}
