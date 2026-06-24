import type * as React from "react";

import {
  DrawerBody as DrawerBodyAtom,
  DrawerContent as DrawerContentAtom,
  DrawerFooter as DrawerFooterAtom,
  DrawerHeader as DrawerHeaderAtom,
  DrawerRoot,
} from "../../atoms/drawer";
import { cn } from "../../lib/utils";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  placement?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  className,
  placement = "right",
  size = "md",
}: DrawerProps) {
  return (
    <DrawerRoot
      isOpen={open}
      onClose={onClose}
      placement={placement}
      size={size}
      hideCloseButton
      classNames={{
        base: cn(
          "border-l-4 border-brand-dark bg-white shadow-[12px_0_0_0_var(--brand-dark)]",
          className,
        ),
      }}
    >
      <DrawerContentAtom>
        {title ? (
          <DrawerHeaderAtom className="font-display text-lg font-black uppercase tracking-widest">
            {title}
          </DrawerHeaderAtom>
        ) : null}
        <DrawerBodyAtom>{children}</DrawerBodyAtom>
      </DrawerContentAtom>
    </DrawerRoot>
  );
}

export const DrawerBody = DrawerBodyAtom;
export const DrawerContent = DrawerContentAtom;
export const DrawerHeader = DrawerHeaderAtom;
export const DrawerFooter = DrawerFooterAtom;
