// @ladle-only
import { Button as HeroUIButton } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroButtonProps = React.ComponentProps<typeof HeroUIButton> & {
  loading?: boolean;
};

export function HeroButton({
  className,
  loading = false,
  children,
  disabled,
  ...props
}: HeroButtonProps) {
  return (
    <HeroUIButton
      className={cn(
        "rounded-none border-2 border-brand-dark bg-brand-dark text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-brand-yellow hover:text-brand-dark disabled:opacity-35",
        className,
      )}
      isDisabled={disabled || loading}
      isLoading={loading}
      {...props}
    >
      {children}
    </HeroUIButton>
  );
}
