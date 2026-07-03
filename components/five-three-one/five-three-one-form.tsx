'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { getOrCreateFiveThreeOneRoutineId, setTrainingMax } from '@/app/(protected)/531/actions';
import { logWorkout } from '@/app/(protected)/log/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { computeFiveThreeOneSets, type FiveThreeOneWeek } from '@/lib/five-three-one';

export type MainLift = { id: string; name: string; category: string };

type TrainingMaxFormValues = { weights: Record<string, number> };

const WEEKS: FiveThreeOneWeek[] = [1, 2, 3, 4];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function FiveThreeOneForm({
  mainLifts,
  trainingMaxes,
}: {
  mainLifts: MainLift[];
  trainingMaxes: Record<string, number>;
}) {
  const router = useRouter();
  const [tmError, setTmError] = useState<string | null>(null);
  const [tmSaved, setTmSaved] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [logSuccess, setLogSuccess] = useState(false);
  const [isSavingTm, setIsSavingTm] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedLiftId, setSelectedLiftId] = useState<string>(mainLifts[0]?.id ?? '');
  const [selectedWeek, setSelectedWeek] = useState<FiveThreeOneWeek>(1);

  const { control, register, getValues } = useForm<TrainingMaxFormValues>({
    defaultValues: {
      weights: Object.fromEntries(mainLifts.map((lift) => [lift.id, trainingMaxes[lift.id] ?? 0])),
    },
  });

  const watchedWeights = useWatch({ control, name: 'weights' });
  const selectedLift = mainLifts.find((lift) => lift.id === selectedLiftId);
  const selectedLiftTm = watchedWeights?.[selectedLiftId] ?? 0;
  const computedSets =
    selectedLiftTm > 0 ? computeFiveThreeOneSets(selectedLiftTm, selectedWeek) : [];

  async function onSaveTrainingMaxes() {
    setTmError(null);
    setTmSaved(false);
    setIsSavingTm(true);
    try {
      const values = getValues('weights');
      const liftsToSave = mainLifts.filter((lift) => (values[lift.id] ?? 0) > 0);
      const results = await Promise.all(
        liftsToSave.map((lift) => setTrainingMax({ exerciseId: lift.id, weight: values[lift.id] })),
      );
      const failed = results.find((result) => !result.success);
      if (failed && !failed.success) {
        setTmError(failed.error);
        return;
      }
      setTmSaved(true);
      router.refresh();
    } finally {
      setIsSavingTm(false);
    }
  }

  async function onLogWorkout() {
    if (!selectedLift || computedSets.length === 0) return;
    setLogError(null);
    setLogSuccess(false);
    setIsLogging(true);
    try {
      const routineResult = await getOrCreateFiveThreeOneRoutineId();
      if (!routineResult.success) {
        setLogError(routineResult.error);
        return;
      }
      const result = await logWorkout({
        workoutDate: todayIsoDate(),
        routineId: routineResult.routineId,
        exercises: [
          {
            exerciseId: selectedLift.id,
            sets: computedSets.map((set) => ({
              reps: set.reps,
              weight: set.weight,
              isWarmup: false,
              isAmrap: set.isAmrap,
            })),
          },
        ],
      });
      if (!result.success) {
        setLogError(result.error);
        return;
      }
      setLogSuccess(true);
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Training maxes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tmError && (
            <p role="alert" className="text-destructive text-sm">
              {tmError}
            </p>
          )}
          {tmSaved && (
            <p role="status" className="text-sm text-green-600 dark:text-green-500">
              Training maxes saved.
            </p>
          )}
          {mainLifts.map((lift) => (
            <div key={lift.id} className="space-y-1">
              <Label htmlFor={`weights.${lift.id}`}>{lift.name}</Label>
              <Input
                id={`weights.${lift.id}`}
                type="number"
                step="0.5"
                inputMode="decimal"
                {...register(`weights.${lift.id}`, { valueAsNumber: true })}
              />
            </div>
          ))}
          <Button
            type="button"
            onClick={onSaveTrainingMaxes}
            disabled={isSavingTm}
            className="w-full"
          >
            {isSavingTm ? 'Saving…' : 'Save training maxes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="lift-select">Lift</Label>
              <Select
                value={selectedLiftId || null}
                onValueChange={(value) => value && setSelectedLiftId(value)}
              >
                <SelectTrigger id="lift-select" className="w-full">
                  <SelectValue placeholder="Select a lift" />
                </SelectTrigger>
                <SelectContent>
                  {mainLifts.map((lift) => (
                    <SelectItem key={lift.id} value={lift.id}>
                      {lift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="week-select">Week</Label>
              <Select
                value={String(selectedWeek)}
                onValueChange={(value) =>
                  value && setSelectedWeek(Number(value) as FiveThreeOneWeek)
                }
              >
                <SelectTrigger id="week-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKS.map((week) => (
                    <SelectItem key={week} value={String(week)}>
                      Week {week}
                      {week === 4 ? ' (deload)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedLiftTm <= 0 ? (
            <p className="text-muted-foreground text-sm">
              Enter and save a training max for {selectedLift?.name ?? 'this lift'} to see computed
              sets.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="font-normal">Set</th>
                  <th className="font-normal">%</th>
                  <th className="font-normal">Weight</th>
                  <th className="font-normal">Reps</th>
                </tr>
              </thead>
              <tbody>
                {computedSets.map((set) => (
                  <tr key={set.setNumber}>
                    <td>{set.setNumber}</td>
                    <td>{Math.round(set.percentage * 100)}%</td>
                    <td>{set.weight}</td>
                    <td>
                      {set.reps}
                      {set.isAmrap ? '+' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {logError && (
            <p role="alert" className="text-destructive text-sm">
              {logError}
            </p>
          )}
          {logSuccess && (
            <p role="status" className="text-sm text-green-600 dark:text-green-500">
              Workout logged.
            </p>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={selectedLiftTm <= 0 || isLogging}
            onClick={onLogWorkout}
          >
            {isLogging ? 'Logging…' : 'Log workout'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
