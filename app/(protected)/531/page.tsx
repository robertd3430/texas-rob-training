import { createClient } from '@/lib/supabase/server';
import { FiveThreeOneForm } from '@/components/five-three-one/five-three-one-form';

export default async function FiveThreeOnePage() {
  const supabase = await createClient();

  const [{ data: mainLifts, error: liftsError }, { data: trainingMaxes, error: tmError }] =
    await Promise.all([
      supabase
        .from('exercises')
        .select('id, name, category')
        .eq('is_main_lift', true)
        .order('category'),
      // Ordered newest-first so the first row seen per exercise below is
      // the current training max; older rows are progression history.
      supabase
        .from('training_maxes')
        .select('exercise_id, weight, effective_date')
        .order('effective_date', { ascending: false }),
    ]);

  if (liftsError || tmError) {
    throw new Error(`Failed to load 5/3/1 data: ${(liftsError ?? tmError)?.message}`);
  }

  const currentTrainingMaxes = new Map<string, number>();
  for (const tm of trainingMaxes ?? []) {
    if (!currentTrainingMaxes.has(tm.exercise_id)) {
      currentTrainingMaxes.set(tm.exercise_id, tm.weight);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">5/3/1</h1>
      <FiveThreeOneForm
        mainLifts={mainLifts ?? []}
        trainingMaxes={Object.fromEntries(currentTrainingMaxes)}
      />
    </div>
  );
}
