import { execFileSync } from 'node:child_process';
import { defineConfig, devices } from '@playwright/test';

// e2e tests exercise real signup/auth, so they must run against local
// Supabase (`supabase start`), never the hosted project in .env.local —
// hitting the hosted project would create real user accounts on every run.
function localSupabaseEnv(): Record<string, string> {
  let output: string;
  try {
    output = execFileSync(
      'supabase',
      [
        'status',
        '-o',
        'env',
        '--override-name',
        'api.url=NEXT_PUBLIC_SUPABASE_URL',
        '--override-name',
        'auth.publishable_key=NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      ],
      { encoding: 'utf8' },
    );
  } catch {
    throw new Error(
      'Local Supabase is not running. Run `supabase start` before `npm run test:e2e`.',
    );
  }

  const env: Record<string, string> = {};
  for (const line of output.split('\n')) {
    const match = /^(NEXT_PUBLIC_SUPABASE_\w+)="?([^"\n]*)"?$/.exec(line.trim());
    if (match) env[match[1]] = match[2];
  }
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'Could not read NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from ' +
        '`supabase status`. Check the --override-name paths still match the installed Supabase CLI.',
    );
  }
  return env;
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  // A cold dev server lazily compiles each route (and each Server Action)
  // on its first request; on a slow filesystem that first compile can take
  // well over Playwright's defaults, so give both the overall test and
  // individual assertions more room.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false,
    timeout: 60_000,
    env: localSupabaseEnv(),
  },
});
