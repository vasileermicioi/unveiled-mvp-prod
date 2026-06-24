import type { ReactElement } from "react";

import { cn } from "../../lib/utils";

export type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children: ReactElement<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  error,
  helper,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={htmlFor} className="unveiled-meta">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[10px] font-black uppercase tracking-widest text-[#b21d17]">
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
