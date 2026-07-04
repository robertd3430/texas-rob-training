// Mirrors weekly_volume_view's per-set volume calculation
// (supabase/migrations/20260703000000_initial_schema.sql): volume = reps × weight.
export function computeSetVolume(reps: number, weight: number): number {
  return reps * weight;
}
