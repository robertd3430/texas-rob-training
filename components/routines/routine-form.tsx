'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { createRoutine } from '@/app/(protected)/routines/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createRoutineSchema, type CreateRoutineInput } from '@/lib/validation/routine';

export type ExerciseOption = { id: string; name: string; category: string };

function emptyExercise() {
  return { exerciseId: '', targetSets: 3, targetReps: 5 };
}

export function RoutineForm({ exercises }: { exercises: ExerciseOption[] }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoutineInput>({
    resolver: zodResolver(createRoutineSchema),
    defaultValues: { name: '', exercises: [emptyExercise()] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    const result = await createRoutine(data);
    if (!result.success) {
      setSubmitError(result.error);
      return;
    }
    router.push('/routines');
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {submitError && (
        <p role="alert" className="text-destructive text-sm">
          {submitError}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

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
          <div key={field.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Exercise {index + 1}</span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove exercise ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor={`exercises.${index}.exerciseId`}>Exercise</Label>
              <Controller
                control={control}
                name={`exercises.${index}.exerciseId`}
                render={({ field: selectField }) => (
                  <Select value={selectField.value || null} onValueChange={selectField.onChange}>
                    <SelectTrigger
                      id={`exercises.${index}.exerciseId`}
                      className="w-full"
                      aria-invalid={!!errors.exercises?.[index]?.exerciseId}
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
              {errors.exercises?.[index]?.exerciseId && (
                <p className="text-destructive text-sm">
                  {errors.exercises[index]?.exerciseId?.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`exercises.${index}.targetSets`}>Target sets</Label>
                <Input
                  id={`exercises.${index}.targetSets`}
                  type="number"
                  inputMode="numeric"
                  {...register(`exercises.${index}.targetSets`, { valueAsNumber: true })}
                />
                {errors.exercises?.[index]?.targetSets && (
                  <p className="text-destructive text-sm">
                    {errors.exercises[index]?.targetSets?.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`exercises.${index}.targetReps`}>Target reps</Label>
                <Input
                  id={`exercises.${index}.targetReps`}
                  type="number"
                  inputMode="numeric"
                  {...register(`exercises.${index}.targetReps`, { valueAsNumber: true })}
                />
                {errors.exercises?.[index]?.targetReps && (
                  <p className="text-destructive text-sm">
                    {errors.exercises[index]?.targetReps?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save routine'}
      </Button>
    </form>
  );
}
