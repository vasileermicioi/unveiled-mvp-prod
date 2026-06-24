export interface LandingHeroProps {
  authenticated: boolean;
}

export function LandingHeroPresentational({ authenticated }: LandingHeroProps) {
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
        <a
          href="/app"
          className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-brand-dark px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-brand-yellow hover:text-brand-dark focus-visible:ring-4 focus-visible:ring-brand-dark/25"
        >
          Become a member
        </a>
        {authenticated ? (
          <a
            href="/app"
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-yellow hover:shadow-[4px_4px_0_0_#202621] focus-visible:ring-4 focus-visible:ring-brand-dark/25"
          >
            Go to app
          </a>
        ) : null}
      </div>
    </section>
  );
}
