import { CardBody, Card as HeroUICard } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../../lib/utils";

export type CardTone = "white" | "yellow" | "cream" | "dark" | "grey";
export type CardElement = "section" | "form";

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
  tone?: CardTone;
  shadow?: boolean;
  as?: CardElement;
};

const TONE_CLASSES: Record<CardTone, string> = {
  white: "bg-white text-brand-dark",
  yellow: "bg-brand-yellow text-brand-dark",
  cream: "bg-brand-cream text-brand-dark",
  dark: "bg-brand-dark text-brand-yellow",
  grey: "bg-brand-grey text-brand-dark",
};

export function Card({
  className,
  interactive = false,
  tone = "white",
  shadow = false,
  as = "section",
  children,
  ...props
}: CardProps) {
  const composedClassName = cn(
    "rounded-none border-4 border-brand-dark p-5 md:p-8",
    TONE_CLASSES[tone],
    interactive && "unveiled-card-hover",
    className,
  );
  const { onSubmit: _ignored, ...rest } =
    props as React.HTMLAttributes<HTMLElement> & {
      onSubmit?: unknown;
    };
  void _ignored;
  if (as === "form") {
    return (
      <form className={composedClassName} {...rest}>
        {children}
      </form>
    );
  }
  return (
    <HeroUICard
      isHoverable={interactive}
      isPressable={interactive}
      shadow={shadow ? "md" : "none"}
      className={composedClassName}
      {...(props as unknown as React.ComponentProps<typeof HeroUICard>)}
    >
      <CardBody className="p-0">{children}</CardBody>
    </HeroUICard>
  );
}
