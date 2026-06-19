import {
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Dropdown as HeroUIDropdown,
} from "@nextui-org/react";
import type * as React from "react";

import { cn } from "./lib/utils";

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

export {
  DropdownItem as MenuItem,
  DropdownMenu as MenuContent,
  DropdownSection as MenuSection,
  DropdownTrigger as MenuTrigger,
};
