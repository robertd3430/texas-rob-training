import { createClient } from '@/lib/supabase/server';
import { RoutineForm } from '@/components/routines/routine-form';

export default async function NewRoutinePage() {
  const supabase = await createClient();
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, name, category')
    .order('category')
    .order('name');

  if (error) {
    throw new Error(`Failed to load exercises: ${error.message}`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">New routine</h1>
      <RoutineForm exercises={exercises ?? []} />
    </div>
  );
}
