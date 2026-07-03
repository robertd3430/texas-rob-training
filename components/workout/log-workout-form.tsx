'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { logWorkout } from '@/app/(protected)/log/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logWorkoutSchema, type LogWorkoutInput } from '@/lib/validation/workout';

export type ExerciseOption = { id: string; name: string; category: string };
export type RoutineOption = {
  id: string;
  name: string;
  exercises: { exerciseId: string; targetSets: number; targetReps: number }[];
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function emptySet() {
  return { reps: 0, weight: 0, isWarmup: false, isAmrap: false };
}

function emptyExercise() {
  return { exerciseId: '', sets: [emptySet()] };
}

function defaultFormValues(workoutDate = todayIsoDate()) {
  return { workoutDate, notes: '', exercises: [emptyExercise()] };
}

function ExerciseBlock({
  control,
  register,
  errors,
  exerciseIndex,
  exercises,
  canRemove,
  onRemove,
}: {
  control: Control<LogWorkoutInput>;
  register: UseFormRegister<LogWorkoutInput>;
  errors: FieldErrors<LogWorkoutInput>;
  exerciseIndex: number;
  exercises: ExerciseOption[];
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });
  const exerciseErrors = errors.exercises?.[exerciseIndex];

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Exercise {exerciseIndex + 1}</span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove exercise ${exerciseIndex + 1}`}
            onClick={onRemove}
          >
            Remove exercise
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`exercises.${exerciseIndex}.exerciseId`}>Exercise</Label>
        <Controller
          control={control}
          name={`exercises.${exerciseIndex}.exerciseId`}
          render={({ field }) => (
            <Select value={field.value || null} onValueChange={field.onChange}>
              <SelectTrigger
                id={`exercises.${exerciseIndex}.exerciseId`}
                className="w-full"
                aria-invalid={!!exerciseErrors?.exerciseId}
              >
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {exerciseErrors?.exerciseId && (
          <p className="text-destructive text-sm">{exerciseErrors.exerciseId.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Sets</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => append(emptySet())}>
            Add set
          </Button>
        </div>

        {exerciseErrors?.sets?.root && (
          <p className="text-destructive text-sm">{exerciseErrors.sets.root.message}</p>
        )}
        {exerciseErrors?.sets?.message && (
          <p className="text-destructive text-sm">{exerciseErrors.sets.message}</p>
        )}

        {fields.map((field, setIndex) => {
          const setErrors = exerciseErrors?.sets?.[setIndex];
          return (
            <div key={field.id} className="space-y-2 rounded-md border p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Set {setIndex + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove set ${setIndex + 1}`}
                    onClick={() => remove(setIndex)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}>Reps</Label>
                  <Input
                    id={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
                    type="number"
                    inputMode="numeric"
                    {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, {
                      valueAsNumber: true,
                    })}
                  />
                  {setErrors?.reps && (
                    <p className="text-destructive text-sm">{setErrors.reps.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}>
                    Weight
                  </Label>
                  <Input
                    id={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weight`, {
                      valueAsNumber: true,
                    })}
                  />
                  {setErrors?.weight && (
                    <p className="text-destructive text-sm">{setErrors.weight.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Controller
                    control={control}
                    name={`exercises.${exerciseIndex}.sets.${setIndex}.isWarmup`}
                    render={({ field }) => (
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  Warmup
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Controller
                    control={control}
                    name={`exercises.${exerciseIndex}.sets.${setIndex}.isAmrap`}
                    render={({ field }) => (
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  AMRAP
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LogWorkoutForm({
  exercises,
  routines,
}: {
  exercises: ExerciseOption[];
  routines: RoutineOption[];
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogWorkoutInput>({
    resolver: zodResolver(logWorkoutSchema),
    defaultValues: defaultFormValues(),
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'exercises' });

  function applyRoutine(routineId: string) {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine || routine.exercises.length === 0) return;
    setSelectedRoutineId(routineId);
    replace(
      routine.exercises.map((re) => ({
        exerciseId: re.exerciseId,
        sets: Array.from({ length: re.targetSets }, () => ({
          reps: re.targetReps,
          weight: 0,
          isWarmup: false,
          isAmrap: false,
        })),
      })),
    );
  }

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    setSubmitted(false);
    const result = await logWorkout({ ...data, routineId: selectedRoutineId ?? undefined });
    if (!result.success) {
      setSubmitError(result.error);
      return;
    }
    setSubmitted(true);
    setSelectedRoutineId(null);
    reset(defaultFormValues(data.workoutDate));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {submitError && (
        <p role="alert" className="text-destructive text-sm">
          {submitError}
        </p>
      )}
      {submitted && (
        <p role="status" className="text-sm text-green-600 dark:text-green-500">
          Workout logged.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="workoutDate">Date</Label>
        <Input id="workoutDate" type="date" {...register('workoutDate')} />
        {errors.workoutDate && (
          <p className="text-destructive text-sm">{errors.workoutDate.message}</p>
        )}
      </div>

      {routines.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="routine-select">Prefill from routine</Label>
          <Select value={selectedRoutineId} onValueChange={(value) => value && applyRoutine(value)}>
            <SelectTrigger id="routine-select" className="w-full">
              <SelectValue placeholder="Choose a routine (optional)" />
            </SelectTrigger>
            <SelectContent>
              {routines.map((routine) => (
                <SelectItem key={routine.id} value={routine.id}>
                  {routine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Exercises</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => append(emptyExercise())}>
            Add exercise
          </Button>
        </div>

        {errors.exercises?.root && (
          <p className="text-destructive text-sm">{errors.exercises.root.message}</p>
        )}
        {errors.exercises?.message && (
          <p className="text-destructive text-sm">{errors.exercises.message}</p>
        )}

        {fields.map((field, index) => (
          <ExerciseBlock
            key={field.id}
            control={control}
            register={register}
            errors={errors}
            exerciseIndex={index}
            exercises={exercises}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Logging…' : 'Log workout'}
      </Button>
    </form>
  );
}
