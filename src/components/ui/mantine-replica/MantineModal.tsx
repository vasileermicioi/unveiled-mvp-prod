// @ladle-only
import { Modal as MantineModalBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
  withFooter?: boolean;
  withForm?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const SIZE_TO_WIDTH: Record<"sm" | "md" | "lg", string> = {
  sm: "min(100%, 420px)",
  md: "min(100%, 640px)",
  lg: "min(100%, 960px)",
};

export function MantineModal({
  opened,
  onClose,
  title,
  size = "md",
  withFooter = false,
  withForm = false,
  children,
  className,
}: MantineModalProps) {
  return (
    <MantineModalBase
      opened={opened}
      onClose={onClose}
      withCloseButton
      centered
      size="lg"
      className={cn("unveiled-mantine-modal", className)}
      styles={{
        content: { width: SIZE_TO_WIDTH[size], maxWidth: SIZE_TO_WIDTH[size] },
      }}
    >
      {title ? <h2 className="unveiled-meta mb-4 text-base">{title}</h2> : null}
      <MantineModalBase.Body>
        {withForm ? (
          <form
            onSubmit={(event) => event.preventDefault()}
            className="grid gap-3"
          >
            {children}
          </form>
        ) : (
          children
        )}
      </MantineModalBase.Body>
      {withFooter ? (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-4 border-brand-dark bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark"
          >
            Close
          </button>
        </div>
      ) : null}
    </MantineModalBase>
  );
}
