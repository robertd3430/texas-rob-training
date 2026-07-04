import Image from 'next/image';
import Link from 'next/link';
import { signup } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <Image
          src="/logo.png"
          alt="Texas Rob Training logo"
          width={140}
          height={140}
          className="object-contain"
          priority
        />
        <h1 className="font-heading text-foreground text-center text-2xl font-bold tracking-widest text-balance uppercase">
          Texas Rob Training
        </h1>
        <p className="text-muted-foreground text-sm tracking-wide uppercase">Create Account</p>
      </div>

      {/* Card */}
      <Card className="border-border bg-card w-full max-w-sm">
        <CardHeader className="pb-2">
          <div className="bg-primary h-1 w-12 rounded-full" aria-hidden="true" />
        </CardHeader>
        <form action={signup}>
          <CardContent className="space-y-4">
            {error && (
              <p
                role="alert"
                className="bg-destructive/15 text-destructive rounded px-3 py-2 text-sm"
              >
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="bg-primary/15 text-primary rounded px-3 py-2 text-sm">
                {message}
              </p>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="mt-4 flex flex-col gap-4">
            <Button
              type="submit"
              className="font-heading bg-primary text-primary-foreground hover:bg-accent w-full font-bold tracking-widest uppercase"
            >
              Sign Up
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-accent font-semibold underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
