import { CardBody, Card as HeroUICard } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../../lib/utils";

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
};

export function Card({
  className,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <HeroUICard
      isHoverable={interactive}
      isPressable={interactive}
      className={cn(
        "rounded-none border-4 border-brand-dark bg-white text-brand-dark",
        interactive && "unveiled-card-hover",
        className,
      )}
      {...(props as unknown as React.ComponentProps<typeof HeroUICard>)}
    >
      <CardBody className="p-0">{children}</CardBody>
    </HeroUICard>
  );
}
