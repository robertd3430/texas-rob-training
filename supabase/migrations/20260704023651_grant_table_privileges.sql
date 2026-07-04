-- Grant table/view privileges to the authenticated role.
--
-- RLS policies restrict *which rows* a role can see/change, but they don't
-- grant access to the table at all — that's a separate GRANT layer. Recent
-- Supabase projects (local and cloud) no longer auto-expose newly created
-- tables/views to the Data API roles (see `api.auto_expose_new_tables` in
-- supabase/config.toml), so every table from the initial schema needs an
-- explicit GRANT here or every query fails with "permission denied for
-- table ..." even though the RLS policies are otherwise correct.

grant select on public.exercises to authenticated;

grant select, insert, update, delete on public.routines to authenticated;
grant select, insert, update, delete on public.routine_exercises to authenticated;
grant select, insert, update, delete on public.workouts to authenticated;
grant select, insert, update, delete on public.workout_sets to authenticated;
grant select, insert, update, delete on public.training_maxes to authenticated;

grant select on public.weekly_volume_view to authenticated;
grant select on public.personal_bests_view to authenticated;
