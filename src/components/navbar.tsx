import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Dev Portfolio Feed
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/posts/new" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                New post
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Profile
              </Link>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
