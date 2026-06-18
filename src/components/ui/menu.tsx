import {
  Dropdown as HeroUIDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type MenuProps = React.ComponentProps<typeof HeroUIDropdown> & {
  className?: string;
};

export function Menu({ className, children, ...props }: MenuProps) {
  return (
    <HeroUIDropdown
      classNames={{
        content: cn(
          "rounded-none border-4 border-brand-dark bg-white p-2 unveiled-shadow",
          className,
        ),
      }}
      {...props}
    >
      {children}
    </HeroUIDropdown>
  );
}

export { DropdownTrigger as MenuTrigger, DropdownMenu as MenuContent, DropdownItem as MenuItem, DropdownSection as MenuSection };
