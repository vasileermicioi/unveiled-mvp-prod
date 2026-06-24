export interface LandingHeaderProps {
  authenticated: boolean;
}

export function LandingHeaderPresentational({
  authenticated,
}: LandingHeaderProps) {
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
          <a
            href="/app"
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-yellow hover:shadow-[4px_4px_0_0_#202621] focus-visible:ring-4 focus-visible:ring-brand-dark/25"
          >
            Go to app
          </a>
        ) : (
          <a
            href="/app/login"
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-brand-dark px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-brand-yellow hover:text-brand-dark focus-visible:ring-4 focus-visible:ring-brand-dark/25"
          >
            Log in
          </a>
        )}
      </nav>
    </header>
  );
}
