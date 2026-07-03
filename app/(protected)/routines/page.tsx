import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deleteRoutine } from './actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function RoutinesPage() {
  const supabase = await createClient();

  const [
    { data: routines, error: routinesError },
    { data: routineExercises, error: exercisesError },
  ] = await Promise.all([
    supabase.from('routines').select('id, name').order('created_at', { ascending: false }),
    supabase
      .from('routine_exercises')
      .select('routine_id, exercise_id, position, target_sets, target_reps, exercises(name)')
      .order('position'),
  ]);

  if (routinesError || exercisesError) {
    throw new Error(`Failed to load routines: ${(routinesError ?? exercisesError)?.message}`);
  }

  const exercisesByRoutine = new Map<string, NonNullable<typeof routineExercises>>();
  for (const re of routineExercises ?? []) {
    const list = exercisesByRoutine.get(re.routine_id) ?? [];
    list.push(re);
    exercisesByRoutine.set(re.routine_id, list);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Routines</h1>
        <Link href="/routines/new" className={buttonVariants({ size: 'sm' })}>
          New routine
        </Link>
      </div>

      {(routines ?? []).length === 0 && (
        <p className="text-muted-foreground text-sm">No routines yet.</p>
      )}

      {(routines ?? []).map((routine) => (
        <Card key={routine.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{routine.name}</CardTitle>
            <form action={deleteRoutine.bind(null, routine.id)}>
              <Button type="submit" variant="outline" size="sm">
                Delete
              </Button>
            </form>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-1 pl-4 text-sm">
              {(exercisesByRoutine.get(routine.id) ?? []).map((re) => (
                <li key={re.exercise_id}>
                  {re.exercises?.name} — {re.target_sets}×{re.target_reps}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
