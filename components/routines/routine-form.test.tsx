import { axe } from 'jest-axe';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutineForm, type ExerciseOption } from './routine-form';
import { createRoutine } from '@/app/(protected)/routines/actions';

vi.mock('@/app/(protected)/routines/actions', () => ({
  createRoutine: vi.fn(),
}));

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockedCreateRoutine = vi.mocked(createRoutine);

const SQUAT_ID = '11111111-1111-4111-8111-111111111111';
const DEADLIFT_ID = '22222222-2222-4222-8222-222222222222';

const exercises: ExerciseOption[] = [
  { id: SQUAT_ID, name: 'Back Squat', category: 'squat' },
  { id: DEADLIFT_ID, name: 'Deadlift', category: 'deadlift' },
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

describe('RoutineForm', () => {
  beforeEach(() => {
    mockedCreateRoutine.mockReset();
    mockPush.mockReset();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RoutineForm exercises={exercises} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('starts with one exercise block defaulted to 3 sets of 5 reps', () => {
    render(<RoutineForm exercises={exercises} />);

    expect(screen.getAllByText(/^Exercise \d+$/)).toHaveLength(1);
    expect(screen.getByLabelText('Target sets')).toHaveValue(3);
    expect(screen.getByLabelText('Target reps')).toHaveValue(5);
    expect(screen.queryByRole('button', { name: /remove exercise/i })).not.toBeInTheDocument();
  });

  it('shows a validation error when submitting without an exercise selected', async () => {
    const user = userEvent.setup();
    render(<RoutineForm exercises={exercises} />);

    await user.click(screen.getByRole('button', { name: /save routine/i }));

    expect(await screen.findByText(/exercise is required/i)).toBeInTheDocument();
    expect(mockedCreateRoutine).not.toHaveBeenCalled();
  });

  it('requires a non-empty name', async () => {
    const user = userEvent.setup();
    render(<RoutineForm exercises={exercises} />);

    await selectExerciseInBlock(user, 'Exercise 1', 'Back Squat');
    await user.click(screen.getByRole('button', { name: /save routine/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(mockedCreateRoutine).not.toHaveBeenCalled();
  });

  it('supports adding and removing exercises', async () => {
    const user = userEvent.setup();
    render(<RoutineForm exercises={exercises} />);

    await user.click(screen.getByRole('button', { name: /add exercise/i }));
    expect(screen.getAllByText(/^Exercise \d+$/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /remove exercise 2/i }));
    expect(screen.getAllByText(/^Exercise \d+$/)).toHaveLength(1);
  });

  it('submits a valid routine and redirects to /routines on success', async () => {
    mockedCreateRoutine.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<RoutineForm exercises={exercises} />);

    await user.type(screen.getByLabelText('Name'), '5/3/1 Squat Day');
    await selectExerciseInBlock(user, 'Exercise 1', 'Back Squat');

    await user.click(screen.getByRole('button', { name: /add exercise/i }));
    await selectExerciseInBlock(user, 'Exercise 2', 'Deadlift');
    const block2 = getExerciseBlock('Exercise 2');
    await user.clear(within(block2).getByLabelText('Target sets'));
    await user.type(within(block2).getByLabelText('Target sets'), '1');
    await user.clear(within(block2).getByLabelText('Target reps'));
    await user.type(within(block2).getByLabelText('Target reps'), '8');

    await user.click(screen.getByRole('button', { name: /save routine/i }));

    await waitFor(() => expect(mockedCreateRoutine).toHaveBeenCalledTimes(1));
    const submitted = mockedCreateRoutine.mock.calls[0][0];
    expect(submitted).toMatchObject({
      name: '5/3/1 Squat Day',
      exercises: [
        { exerciseId: SQUAT_ID, targetSets: 3, targetReps: 5 },
        { exerciseId: DEADLIFT_ID, targetSets: 1, targetReps: 8 },
      ],
    });
    expect(mockPush).toHaveBeenCalledWith('/routines');
  });

  it('shows the server-returned error on failure and does not redirect', async () => {
    mockedCreateRoutine.mockResolvedValue({ success: false, error: 'Something went wrong' });
    const user = userEvent.setup();
    render(<RoutineForm exercises={exercises} />);

    await user.type(screen.getByLabelText('Name'), 'Bad Routine');
    await selectExerciseInBlock(user, 'Exercise 1', 'Back Squat');
    await user.click(screen.getByRole('button', { name: /save routine/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
