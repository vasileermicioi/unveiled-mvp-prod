// @ladle-only
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
};

export function HeroField({
  label,
  htmlFor,
  error,
  helper,
  children,
  className,
}: HeroFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={htmlFor} className="unveiled-meta">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-error">
          {error}
        </span>
      ) : helper ? (
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          {helper}
        </span>
      ) : null}
    </div>
  );
}
