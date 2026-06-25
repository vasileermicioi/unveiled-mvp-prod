import type { ReactNode } from "react";

import { Card } from "../../atoms/card";
import { cn } from "../../lib/utils";

const STATE_PANEL_TONES = {
  empty: "bg-brand-cream text-brand-dark",
  loading: "bg-brand-cream text-brand-dark",
  error: "bg-white text-brand-dark",
  success: "bg-brand-yellow text-brand-dark",
} as const;

export type StatePanelState = "empty" | "loading" | "error" | "success";

export type StatePanelProps = {
  title: string;
  text: string;
  state?: StatePanelState;
  action?: ReactNode;
  className?: string;
};

export function StatePanel({
  title,
  text,
  state = "empty",
  action,
  className,
}: StatePanelProps) {
  return (
    <Card
      className={cn(
        "grid min-h-44 place-items-center border-4 border-brand-dark p-5 text-center md:p-8",
        STATE_PANEL_TONES[state],
        className,
      )}
    >
      <div className="max-w-md space-y-4">
        <p className="headline-md">{title}</p>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">
          {text}
        </p>
        {action}
      </div>
    </Card>
  );
}
