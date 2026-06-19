// @ladle-only
import { Textarea } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroTextAreaProps = React.ComponentProps<typeof Textarea>;

export function HeroTextArea({ className, ...props }: HeroTextAreaProps) {
  return (
    <Textarea
      classNames={{
        base: "min-h-0",
        inputWrapper: cn(
          "!h-auto min-h-0 rounded-none border-4 border-brand-dark bg-white px-4 py-3 text-sm font-bold placeholder:text-brand-dark/30 focus-within:bg-brand-cream focus-within:ring-4 focus-within:ring-brand-dark/15 disabled:bg-brand-grey disabled:opacity-50",
          className,
        ),
        input: "bg-transparent",
      }}
      variant="flat"
      {...props}
    />
  );
}
