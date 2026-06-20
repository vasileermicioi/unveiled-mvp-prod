import { Button } from "@unveiled/design-system";

export function LandingHero({ authenticated }: { authenticated: boolean }) {
  return (
    <section
      aria-label="Curated cultural access"
      className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 py-24"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/70">
        Unveiled Berlin
      </p>
      <h1 className="text-5xl font-black uppercase tracking-tight text-brand-dark md:text-7xl">
        Curated cultural access, one event at a time.
      </h1>
      <p className="max-w-2xl text-lg text-brand-dark/80">
        Become a member to unlock partner-quiet invitations to Berlin&rsquo;s
        most interesting live events. No queue. No algorithm. Just the people
        who already know what&rsquo;s good this week.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="default" size="lg">
          <a href="/app">Become a member</a>
        </Button>
        {authenticated ? (
          <Button asChild variant="secondary" size="lg">
            <a href="/app">Go to app</a>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
