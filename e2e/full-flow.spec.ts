import { expect, test } from '@playwright/test';

// Exercises the full user journey against local Supabase (see
// playwright.config.ts): signup → routine → log workout → dashboard.
// Requires `supabase start` first; local dev has email confirmation
// disabled (supabase/config.toml [auth.email] enable_confirmations = false),
// so signup returns an active session immediately and logs the user
// straight in — there's no separate login step or email to check.
test('user can sign up, create a routine, log a workout from it, and see it on the dashboard', async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'password123';

  await test.step('sign up', async () => {
    await page.goto('/signup');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  await test.step('create a routine', async () => {
    await page.goto('/routines/new');
    await page.getByLabel('Name').fill('E2E Squat Day');
    await page.getByRole('combobox', { name: 'Exercise' }).click();
    await page.getByRole('option', { name: 'Back Squat' }).click();
    await page.getByLabel('Target sets').fill('1');
    await page.getByLabel('Target reps').fill('5');
    await page.getByRole('button', { name: 'Save routine' }).click();
    await expect(page).toHaveURL('/routines');
    // CardTitle renders a styled <div>, not a semantic heading, so match by text.
    await expect(page.getByText('E2E Squat Day')).toBeVisible();
  });

  await test.step('log a workout from the routine', async () => {
    await page.goto('/log');
    await page.getByRole('combobox', { name: /prefill from routine/i }).click();
    await page.getByRole('option', { name: 'E2E Squat Day' }).click();
    await page.getByLabel('Weight').fill('225');
    await page.getByRole('button', { name: 'Log workout' }).click();
    await expect(page.getByRole('status')).toContainText(/workout logged/i);
  });

  await test.step('see the workout reflected on the dashboard', async () => {
    await page.goto('/');
    await expect(page.getByText(/E2E Squat Day.*Back Squat/)).toBeVisible();
    await expect(page.getByText('225 × 5')).toBeVisible();

    // `div` + hasText matches every nested ancestor div, not just the card,
    // so scope on the actual card element (data-slot="card") instead.
    const thisWeekCard = page.locator('[data-slot="card"]', { hasText: 'This week' });
    await expect(thisWeekCard.getByText('1,125 lb')).toBeVisible();
  });
});
