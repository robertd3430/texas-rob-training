'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { credentialsSchema } from '@/lib/validation/auth';

function firstError(result: { error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message ?? 'Invalid input';
}

export async function login(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(firstError(parsed))}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    redirect(`/signup?error=${encodeURIComponent(firstError(parsed))}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // When email confirmation is disabled (e.g. local dev), signUp returns an
  // active session immediately and there's no email to check — go straight
  // in. Otherwise the account needs confirmation before it can log in.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/');
  }

  redirect('/signup?message=Check your email to confirm your account');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
