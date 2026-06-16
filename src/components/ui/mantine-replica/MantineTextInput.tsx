// @ladle-only
import { TextInput as MantineTextInputBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineTextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref"> {
  label?: string;
  error?: string;
  helper?: string;
  className?: string;
}

export function MantineTextInput({
  label,
  error,
  helper,
  className,
  ...props
}: MantineTextInputProps) {
  return (
    <div className="grid gap-2">
      {label ? <span className="unveiled-meta">{label}</span> : null}
      <MantineTextInputBase
        className={cn("unveiled-mantine-text-input", className)}
        error={error}
        {...(props as React.ComponentProps<typeof MantineTextInputBase>)}
      />
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
