-- Predefined exercise catalog. Runs as service_role (bypasses RLS).
-- Idempotent: safe to re-run via `supabase db reset`.

insert into public.exercises (name, category, is_main_lift) values
  -- Squat
  ('Back Squat',            'squat',    true),
  ('Front Squat',           'squat',    false),
  ('Box Squat',             'squat',    false),
  ('Pause Squat',           'squat',    false),
  ('Goblet Squat',          'squat',    false),
  ('Bulgarian Split Squat', 'squat',    false),
  ('Leg Press',             'squat',    false),
  ('Walking Lunge',         'squat',    false),

  -- Bench
  ('Bench Press',           'bench',    true),
  ('Close-Grip Bench Press','bench',    false),
  ('Incline Bench Press',   'bench',    false),
  ('Dumbbell Bench Press',  'bench',    false),
  ('Dumbbell Incline Press','bench',    false),
  ('Floor Press',           'bench',    false),
  ('Pause Bench Press',     'bench',    false),

  -- Deadlift
  ('Deadlift',              'deadlift', true),
  ('Sumo Deadlift',         'deadlift', false),
  ('Romanian Deadlift',     'deadlift', false),
  ('Stiff-Leg Deadlift',    'deadlift', false),
  ('Deficit Deadlift',      'deadlift', false),
  ('Rack Pull',             'deadlift', false),
  ('Trap Bar Deadlift',     'deadlift', false),
  ('Good Morning',          'deadlift', false),

  -- Press
  ('Overhead Press',        'press',    true),
  ('Push Press',            'press',    false),
  ('Seated Dumbbell Press', 'press',    false),
  ('Behind-the-Neck Press', 'press',    false),
  ('Landmine Press',        'press',    false),
  ('Z Press',               'press',    false),

  -- Accessories
  ('Barbell Row',           'accessory', false),
  ('Dumbbell Row',          'accessory', false),
  ('Pendlay Row',           'accessory', false),
  ('Pull-Up',               'accessory', false),
  ('Chin-Up',               'accessory', false),
  ('Lat Pulldown',          'accessory', false),
  ('Dip',                   'accessory', false),
  ('Push-Up',               'accessory', false),
  ('Barbell Curl',          'accessory', false),
  ('Dumbbell Curl',         'accessory', false),
  ('Hammer Curl',           'accessory', false),
  ('Skull Crusher',         'accessory', false),
  ('Triceps Pushdown',      'accessory', false),
  ('Lateral Raise',         'accessory', false),
  ('Face Pull',             'accessory', false),
  ('Rear Delt Fly',         'accessory', false),
  ('Shrug',                 'accessory', false),
  ('Hip Thrust',            'accessory', false),
  ('Leg Curl',              'accessory', false),
  ('Leg Extension',         'accessory', false),
  ('Calf Raise',            'accessory', false),
  ('Back Extension',        'accessory', false),
  ('Hanging Leg Raise',     'accessory', false),
  ('Ab Wheel Rollout',      'accessory', false),
  ('Plank',                 'accessory', false),
  ('Kettlebell Swing',      'accessory', false),
  ('Farmer''s Carry',       'accessory', false)
on conflict (name) do nothing;
