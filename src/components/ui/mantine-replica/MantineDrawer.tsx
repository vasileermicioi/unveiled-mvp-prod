// @ladle-only
import { Drawer as MantineDrawerBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineDrawerProps {
  opened: boolean;
  onClose: () => void;
  position?: "left" | "right";
  withForm?: boolean;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export function MantineDrawer({
  opened,
  onClose,
  position = "right",
  withForm = false,
  title,
  children,
  className,
}: MantineDrawerProps) {
  return (
    <MantineDrawerBase
      opened={opened}
      onClose={onClose}
      position={position}
      withCloseButton
      className={cn("unveiled-mantine-drawer", className)}
    >
      {title ? <h2 className="unveiled-meta mb-4 text-base">{title}</h2> : null}
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
    </MantineDrawerBase>
  );
}
