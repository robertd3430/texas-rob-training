import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';

// Second line of defense: the proxy already gates these routes, but this
// layout re-checks so a proxy misconfiguration (e.g. a matcher gap) fails
// closed instead of rendering protected pages. RLS remains the final gate.
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Texas Rob Training</span>
          <Link href="/log" className="text-sm underline">
            Log workout
          </Link>
          <Link href="/routines" className="text-sm underline">
            Routines
          </Link>
          <Link href="/531" className="text-sm underline">
            5/3/1
          </Link>
          <Link href="/history" className="text-sm underline">
            History
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">{claims.email as string}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
