import { describe, expect, it } from 'vitest';
import { credentialsSchema } from './auth';

describe('credentialsSchema', () => {
  it('accepts a valid email and password', () => {
    expect(
      credentialsSchema.safeParse({ email: 'rob@example.com', password: 'password123' }).success,
    ).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = credentialsSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects a password under 6 characters', () => {
    const result = credentialsSchema.safeParse({ email: 'rob@example.com', password: '12345' });
    expect(result.success).toBe(false);
  });

  it('accepts a password of exactly 6 characters', () => {
    expect(
      credentialsSchema.safeParse({ email: 'rob@example.com', password: '123456' }).success,
    ).toBe(true);
  });

  it('rejects a missing email or password', () => {
    expect(credentialsSchema.safeParse({ password: 'password123' }).success).toBe(false);
    expect(credentialsSchema.safeParse({ email: 'rob@example.com' }).success).toBe(false);
  });
});
