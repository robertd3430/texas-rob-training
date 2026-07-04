import { axe } from 'jest-axe';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogWorkoutForm, type ExerciseOption, type RoutineOption } from './log-workout-form';
import { logWorkout } from '@/app/(protected)/log/actions';

vi.mock('@/app/(protected)/log/actions', () => ({
  logWorkout: vi.fn(),
}));

const mockedLogWorkout = vi.mocked(logWorkout);

const SQUAT_ID = '11111111-1111-4111-8111-111111111111';
const BENCH_ID = '22222222-2222-4222-8222-222222222222';
const DEADLIFT_ID = '33333333-3333-4333-8333-333333333333';

const exercises: ExerciseOption[] = [
  { id: SQUAT_ID, name: 'Back Squat', category: 'squat' },
  { id: BENCH_ID, name: 'Bench Press', category: 'bench' },
  { id: DEADLIFT_ID, name: 'Deadlift', category: 'deadlift' },
];

const routines: RoutineOption[] = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: '5/3/1 Squat Day',
    exercises: [
      { exerciseId: SQUAT_ID, targetSets: 3, targetReps: 5 },
      { exerciseId: DEADLIFT_ID, targetSets: 1, targetReps: 8 },
    ],
  },
];

function getExerciseBlock(label: string) {
  return screen.getByText(label).closest('.rounded-lg') as HTMLElement;
}

async function selectExerciseInBlock(
  user: ReturnType<typeof userEvent.setup>,
  blockLabel: string,
  optionName: string,
) {
  const block = getExerciseBlock(blockLabel);
  await user.click(within(block).getByRole('combobox', { name: /^exercise$/i }));
  const option = await screen.findByRole('option', { name: optionName });
  await user.click(option);
}

describe('LogWorkoutForm', () => {
  beforeEach(() => {
    mockedLogWorkout.mockReset();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LogWorkoutForm exercises={exercises} routines={routines} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows a validation error when submitting without an exercise selected', async () => {
    const user = userEvent.setup();
    render(<LogWorkoutForm exercises={exercises} routines={[]} />);

    await user.click(screen.getByRole('button', { name: /log workout/i }));

    expect(await screen.findByText(/exercise is required/i)).toBeInTheDocument();
    expect(mockedLogWorkout).not.toHaveBeenCalled();
  });

  it('starts with one exercise block containing one set row', async () => {
    render(<LogWorkoutForm exercises={exercises} routines={[]} />);

    expect(screen.getAllByText(/^Exercise \d+$/)).toHaveLength(1);
    expect(screen.getAllByText(/^Set \d+$/)).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /remove exercise/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove set/i })).not.toBeInTheDocument();
  });

  it('supports adding and removing both exercises and sets', async () => {
    const user = userEvent.setup();
    render(<LogWorkoutForm exercises={exercises} routines={[]} />);

    await user.click(screen.getByRole('button', { name: /add exercise/i }));
    expect(screen.getAllByText(/^Exercise \d+$/)).toHaveLength(2);

    const firstBlock = getExerciseBlock('Exercise 1');
    await user.click(within(firstBlock).getByRole('button', { name: /add set/i }));
    expect(within(firstBlock).getAllByText(/^Set \d+$/)).toHaveLength(2);

    await user.click(within(firstBlock).getByRole('button', { name: /remove set 2/i }));
    expect(within(firstBlock).getAllByText(/^Set \d+$/)).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /remove exercise 2/i }));
    expect(screen.getAllByText(/^Exercise \d+$/)).toHaveLength(1);
  });

  it('rejects negative reps and negative weight on submit', async () => {
    const user = userEvent.setup();
    render(<LogWorkoutForm exercises={exercises} routines={[]} />);

    await selectExerciseInBlock(user, 'Exercise 1', 'Back Squat');

    const repsInput = screen.getByLabelText('Reps');
    const weightInput = screen.getByLabelText('Weight');
    await user.clear(repsInput);
    await user.type(repsInput, '-1');
    await user.clear(weightInput);
    await user.type(weightInput, '-5');

    await user.click(screen.getByRole('button', { name: /log workout/i }));

    expect(await screen.findByText(/reps cannot be negative/i)).toBeInTheDocument();
    expect(screen.getByText(/weight cannot be negative/i)).toBeInTheDocument();
    expect(mockedLogWorkout).not.toHaveBeenCalled();
  });

  it('submits a valid multi-exercise workout with warmup and AMRAP flags and shows success', async () => {
    mockedLogWorkout.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<LogWorkoutForm exercises={exercises} routines={[]} />);

    await selectExerciseInBlock(user, 'Exercise 1', 'Bench Press');
    const block1 = getExerciseBlock('Exercise 1');
    await user.clear(within(block1).getByLabelText('Reps'));
    await user.type(within(block1).getByLabelText('Reps'), '8');
    await user.clear(within(block1).getByLabelText('Weight'));
    await user.type(within(block1).getByLabelText('Weight'), '135');
    await user.click(within(block1).getByRole('checkbox', { name: /warmup/i }));

    await user.click(screen.getByRole('button', { name: /add exercise/i }));
    await selectExerciseInBlock(user, 'Exercise 2', 'Deadlift');
    const block2 = getExerciseBlock('Exercise 2');
    await user.clear(within(block2).getByLabelText('Reps'));
    await user.type(within(block2).getByLabelText('Reps'), '5');
    await user.clear(within(block2).getByLabelText('Weight'));
    await user.type(within(block2).getByLabelText('Weight'), '225');
    await user.click(within(block2).getByRole('checkbox', { name: /amrap/i }));

    await user.click(screen.getByRole('button', { name: /log workout/i }));

    await waitFor(() => expect(mockedLogWorkout).toHaveBeenCalledTimes(1));
    const submitted = mockedLogWorkout.mock.calls[0][0];
    expect(submitted.exercises).toHaveLength(2);
    expect(submitted.exercises[0]).toMatchObject({
      exerciseId: BENCH_ID,
      sets: [{ reps: 8, weight: 135, isWarmup: true, isAmrap: false }],
    });
    expect(submitted.exercises[1]).toMatchObject({
      exerciseId: DEADLIFT_ID,
      sets: [{ reps: 5, weight: 225, isAmrap: true }],
    });
    expect(submitted.routineId).toBeUndefined();

    expect(await screen.findByRole('status')).toHaveTextContent(/workout logged/i);
  });

  it('shows the server-returned error on failure', async () => {
    mockedLogWorkout.mockResolvedValue({ success: false, error: 'Something went wrong' });
    const user = userEvent.setup();
    render(<LogWorkoutForm exercises={exercises} routines={[]} />);

    await selectExerciseInBlock(user, 'Exercise 1', 'Back Squat');
    await user.click(screen.getByRole('button', { name: /log workout/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
  });

  describe('routine prefill', () => {
    it('replaces the exercise blocks with the routine’s exercises and target sets/reps', async () => {
      const user = userEvent.setup();
      render(<LogWorkoutForm exercises={exercises} routines={routines} />);

      await user.click(screen.getByRole('combobox', { name: /prefill from routine/i }));
      await user.click(await screen.findByRole('option', { name: '5/3/1 Squat Day' }));

      // Routine has 2 exercises: Back Squat (3 sets) and Deadlift (1 set).
      expect(screen.getAllByText(/^Exercise \d+$/)).toHaveLength(2);
      const squatBlock = getExerciseBlock('Exercise 1');
      expect(within(squatBlock).getAllByText(/^Set \d+$/)).toHaveLength(3);
      expect(within(squatBlock).getAllByLabelText('Reps')[0]).toHaveValue(5);

      const deadliftBlock = getExerciseBlock('Exercise 2');
      expect(within(deadliftBlock).getAllByText(/^Set \d+$/)).toHaveLength(1);
      expect(within(deadliftBlock).getByLabelText('Reps')).toHaveValue(8);
    });

    it('submits the selected routine id alongside the prefilled exercises', async () => {
      mockedLogWorkout.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      render(<LogWorkoutForm exercises={exercises} routines={routines} />);

      await user.click(screen.getByRole('combobox', { name: /prefill from routine/i }));
      await user.click(await screen.findByRole('option', { name: '5/3/1 Squat Day' }));

      await user.click(screen.getByRole('button', { name: /log workout/i }));

      await waitFor(() => expect(mockedLogWorkout).toHaveBeenCalledTimes(1));
      const submitted = mockedLogWorkout.mock.calls[0][0];
      expect(submitted.routineId).toBe(routines[0].id);
      expect(submitted.exercises).toHaveLength(2);
      expect(submitted.exercises[0].exerciseId).toBe(SQUAT_ID);
      expect(submitted.exercises[0].sets).toHaveLength(3);
      expect(submitted.exercises[1].exerciseId).toBe(DEADLIFT_ID);
      expect(submitted.exercises[1].sets).toHaveLength(1);
    });

    it('does not show a routine picker when the user has no routines', () => {
      render(<LogWorkoutForm exercises={exercises} routines={[]} />);
      expect(
        screen.queryByRole('combobox', { name: /prefill from routine/i }),
      ).not.toBeInTheDocument();
    });
  });
});
