import type { ReactElement } from "react";

export interface PublicDiscoverHeaderProps {
  eyebrow: string;
  eyebrowTone?: "yellow" | "dark" | "white" | "grey";
  title: string;
  body: string;
}

export function PublicDiscoverHeaderPresentational({
  eyebrow,
  eyebrowTone = "yellow",
  title,
  body,
}: PublicDiscoverHeaderProps): ReactElement {
  const eyebrowClass =
    eyebrowTone === "yellow"
      ? "bg-brand-yellow text-brand-dark"
      : eyebrowTone === "white"
        ? "bg-white text-brand-dark"
        : eyebrowTone === "grey"
          ? "bg-brand-grey text-brand-dark"
          : "bg-brand-dark text-white";
  return (
    <section className="border-4 border-brand-dark bg-white p-5 md:p-7">
      <span
        className={`inline-flex items-center gap-1 border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${eyebrowClass}`}
      >
        {eyebrow}
      </span>
      <h1 className="headline-lg mt-5">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg font-bold leading-relaxed">{body}</p>
    </section>
  );
}
