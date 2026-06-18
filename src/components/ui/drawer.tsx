import {
  Drawer as HeroUIDrawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter as HeroUIDrawerFooter,
  DrawerHeader,
} from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

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
    <HeroUIDrawer
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
      <DrawerContent>
        {title ? (
          <DrawerHeader className="font-display text-lg font-black uppercase tracking-widest">
            {title}
          </DrawerHeader>
        ) : null}
        <DrawerBody>{children}</DrawerBody>
      </DrawerContent>
    </HeroUIDrawer>
  );
}

export const DrawerFooter = HeroUIDrawerFooter;
export { DrawerBody, DrawerContent, DrawerHeader };
