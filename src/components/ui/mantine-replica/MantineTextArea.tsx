// @ladle-only
import { Textarea as MantineTextAreaBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineTextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "ref"> {
  label?: string;
  error?: string;
  helper?: string;
  className?: string;
}

export function MantineTextArea({
  label,
  error,
  helper,
  className,
  ...props
}: MantineTextAreaProps) {
  return (
    <div className="grid gap-2">
      {label ? <span className="unveiled-meta">{label}</span> : null}
      <MantineTextAreaBase
        className={cn("unveiled-mantine-textarea", className)}
        error={error}
        minRows={4}
        {...(props as React.ComponentProps<typeof MantineTextAreaBase>)}
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
