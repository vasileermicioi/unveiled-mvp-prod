export function LandingFooter() {
  return (
    <footer
      role="contentinfo"
      aria-label="Unveiled footer"
      className="border-t border-brand-dark bg-white px-6 py-8"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/70">
          © Unveiled Berlin
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          <a
            href="/app/login"
            className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark underline decoration-2 underline-offset-4"
          >
            Log in
          </a>
          <a
            href="/app"
            className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark underline decoration-2 underline-offset-4"
          >
            Become a member
          </a>
        </nav>
      </div>
    </footer>
  );
}
