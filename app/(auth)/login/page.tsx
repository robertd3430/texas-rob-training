import Image from 'next/image';
import Link from 'next/link';
import { login } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
        <p className="text-muted-foreground text-sm tracking-wide uppercase">Member Login</p>
      </div>

      {/* Card */}
      <Card className="border-border bg-card w-full max-w-sm">
        <CardHeader className="pb-2">
          <div className="bg-primary h-1 w-12 rounded-full" aria-hidden="true" />
        </CardHeader>
        <form action={login}>
          <CardContent className="space-y-4">
            {error && (
              <p
                role="alert"
                className="bg-destructive/15 text-destructive rounded px-3 py-2 text-sm"
              >
                {error}
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
                autoComplete="current-password"
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
              Log In
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              No account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:text-accent font-semibold underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
