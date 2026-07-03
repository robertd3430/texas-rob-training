import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.email('Enter a valid email address'),
  // Supabase's default minimum password length
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type Credentials = z.infer<typeof credentialsSchema>;
