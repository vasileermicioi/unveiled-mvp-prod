import type * as React from "react";

import {
  MenuContentAtom,
  MenuItemAtom,
  MenuRoot,
  MenuSectionAtom,
  MenuTriggerAtom,
} from "../../atoms/menu";
import { cn } from "../../lib/utils";

export type MenuProps = React.ComponentProps<typeof MenuRoot> & {
  className?: string;
};

export function Menu({ className, children, ...props }: MenuProps) {
  return (
    <MenuRoot
      classNames={{
        content: cn(
          "rounded-none border-4 border-brand-dark bg-white p-2 unveiled-shadow",
          className,
        ),
      }}
      {...props}
    >
      {children}
    </MenuRoot>
  );
}

export const MenuItem = MenuItemAtom;
export const MenuContent = MenuContentAtom;
export const MenuSection = MenuSectionAtom;
export const MenuTrigger = MenuTriggerAtom;
