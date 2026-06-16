// @ladle-only
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}

export function MantineField({
  label,
  htmlFor,
  error,
  helper,
  children,
  className,
}: MantineFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={htmlFor} className="unveiled-meta">
        {label}
      </label>
      {children}
      {error ? (
        <span className="unveiled-mantine-error-text">{error}</span>
      ) : helper ? (
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          {helper}
        </span>
      ) : null}
    </div>
  );
}
