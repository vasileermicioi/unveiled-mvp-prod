// @ladle-only
import { Input } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroTextInputProps = React.ComponentProps<typeof Input>;

export function HeroTextInput({ className, ...props }: HeroTextInputProps) {
  return (
    <Input
      classNames={{
        base: "min-h-0",
        inputWrapper: cn(
          "rounded-none border-4 border-brand-dark bg-white px-4 py-3 text-sm font-bold placeholder:text-brand-dark/30 focus-within:bg-brand-cream focus-within:ring-4 focus-within:ring-brand-dark/15 disabled:bg-brand-grey disabled:opacity-50",
          className,
        ),
        input: "bg-transparent",
      }}
      variant="flat"
      {...props}
    />
  );
}
