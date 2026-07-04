import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect('/login');
  }

  const navLinks = [
    { href: '/log', label: 'Log Workout' },
    { href: '/routines', label: 'Routines' },
    { href: '/531', label: '5/3/1' },
    { href: '/history', label: 'History' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          {/* Logo + brand */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Texas Rob Training logo"
              width={52}
              height={52}
              className="rounded-sm object-contain"
              priority
            />
            <span className="font-heading text-foreground hidden text-lg font-bold tracking-widest uppercase sm:block">
              Texas Rob Training
            </span>
          </Link>

          {/* Nav links */}
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-heading text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded px-3 py-1.5 text-sm font-semibold tracking-wider uppercase transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User + logout */}
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-muted-foreground hidden max-w-[180px] truncate text-sm md:block">
              {claims.email as string}
            </span>
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="font-heading border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold tracking-wider uppercase"
              >
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
    </div>
  );
}
