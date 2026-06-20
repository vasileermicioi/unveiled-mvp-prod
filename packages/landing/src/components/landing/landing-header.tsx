import { Button } from "@unveiled/design-system";

export function LandingHeader({ authenticated }: { authenticated: boolean }) {
  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-brand-dark bg-white px-6 py-4">
      <a
        href="/"
        className="font-black uppercase tracking-[0.18em] text-brand-dark text-[10px]"
      >
        Unveiled
      </a>
      <nav aria-label="Primary" className="flex items-center gap-3">
        {authenticated ? (
          <Button asChild variant="secondary" size="sm">
            <a href="/app">Go to app</a>
          </Button>
        ) : (
          <Button asChild variant="default" size="sm">
            <a href="/app/login">Log in</a>
          </Button>
        )}
      </nav>
    </header>
  );
}
