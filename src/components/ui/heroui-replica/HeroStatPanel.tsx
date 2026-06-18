// @ladle-only
import { cn } from "@/lib/utils";
import { HeroCard } from "./HeroCard";

export type HeroStatPanelProps = {
  label: string;
  value: string;
  caption?: string;
  className?: string;
};

export function HeroStatPanel({
  label,
  value,
  caption,
  className,
}: HeroStatPanelProps) {
  return (
    <HeroCard className={cn("p-4 md:p-6", className)}>
      <p className="unveiled-meta opacity-45">{label}</p>
      <p className="mt-3 font-display text-4xl font-black uppercase leading-none md:text-6xl">
        {value}
      </p>
      {caption ? (
        <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">
          {caption}
        </p>
      ) : null}
    </HeroCard>
  );
}
