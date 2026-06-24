import { Card } from "../../atoms/card";
import { cn } from "../../lib/utils";

export type StatPanelProps = {
  label: string;
  value: string;
  caption?: string;
  className?: string;
};

export function StatPanel({
  label,
  value,
  caption,
  className,
}: StatPanelProps) {
  return (
    <Card className={cn("p-4 md:p-6", className)}>
      <p className="unveiled-meta opacity-45">{label}</p>
      <p className="mt-3 font-display text-4xl font-black uppercase leading-none md:text-6xl">
        {value}
      </p>
      {caption ? (
        <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">
          {caption}
        </p>
      ) : null}
    </Card>
  );
}
