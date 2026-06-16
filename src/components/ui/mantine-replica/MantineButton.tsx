// @ladle-only
import { Button as MantineButtonBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export type MantineButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "yellow"
  | "active"
  | "copied"
  | "destructive"
  | "ghost"
  | "outline"
  | "muted"
  | "link";

export type MantineButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm";

const VARIANT_TO_MANTINE: Record<
  MantineButtonVariant,
  {
    color?: string;
    variant?: string;
    bg: string;
    fg: string;
    border: boolean;
  }
> = {
  default: {
    color: "brandDark",
    bg: "var(--brand-dark)",
    fg: "var(--brand-white)",
    border: true,
  },
  primary: {
    color: "brandDark",
    bg: "var(--brand-dark)",
    fg: "var(--brand-white)",
    border: true,
  },
  secondary: {
    color: "brandWhite",
    bg: "var(--brand-white)",
    fg: "var(--brand-dark)",
    border: true,
  },
  yellow: {
    color: "brandYellow",
    bg: "var(--brand-yellow)",
    fg: "var(--brand-dark)",
    border: true,
  },
  active: {
    color: "brandYellow",
    bg: "var(--brand-yellow)",
    fg: "var(--brand-dark)",
    border: true,
  },
  copied: {
    color: "brandYellow",
    bg: "var(--brand-yellow)",
    fg: "var(--brand-dark)",
    border: true,
  },
  destructive: {
    color: "brandError",
    bg: "var(--brand-error)",
    fg: "var(--brand-dark)",
    border: true,
  },
  ghost: { bg: "transparent", fg: "var(--brand-dark)", border: false },
  outline: { bg: "transparent", fg: "var(--brand-dark)", border: true },
  muted: {
    color: "brandGrey",
    bg: "var(--brand-grey)",
    fg: "var(--brand-dark)",
    border: true,
  },
  link: { bg: "transparent", fg: "var(--brand-dark)", border: false },
};

const SIZE_TO_CLASS: Record<MantineButtonSize, string> = {
  default: "min-h-11 px-5 py-3",
  sm: "min-h-9 px-3 py-2 text-[9px]",
  lg: "min-h-14 px-7 py-4 text-xs",
  icon: "size-11 p-0",
  "icon-sm": "size-9 p-0",
};

export interface MantineButtonProps
  extends Omit<React.ComponentProps<"button">, "ref"> {
  variant?: MantineButtonVariant;
  size?: MantineButtonSize;
  asChild?: boolean;
  loading?: boolean;
  className?: string;
}

export function MantineButton({
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  className,
  style,
  children,
  ...props
}: MantineButtonProps) {
  const mapping = VARIANT_TO_MANTINE[variant];
  const isActive = variant === "active" || variant === "copied";
  const isLink = variant === "link";
  const composedStyle: React.CSSProperties = {
    backgroundColor: mapping.bg,
    color: mapping.fg,
    borderColor: mapping.border ? "var(--brand-dark)" : "transparent",
    borderWidth: mapping.border ? 4 : 0,
    borderStyle: "solid",
    ...(isLink
      ? { paddingLeft: 0, paddingRight: 0, textDecoration: "underline" }
      : null),
    ...style,
  };
  const composedClassName = cn(
    "unveiled-mantine-button-root",
    SIZE_TO_CLASS[size],
    className,
  );
  if (asChild) {
    return (
      <MantineButtonBase
        component="span"
        data-active={isActive ? "true" : undefined}
        data-loading={loading ? "true" : undefined}
        disabled={disabled || loading}
        className={composedClassName}
        style={composedStyle}
        {...(props as React.ComponentProps<typeof MantineButtonBase>)}
      >
        {children}
      </MantineButtonBase>
    );
  }
  return (
    <MantineButtonBase
      data-active={isActive ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      disabled={disabled || loading}
      className={composedClassName}
      style={composedStyle}
      {...(props as React.ComponentProps<typeof MantineButtonBase>)}
    >
      {loading ? <span aria-hidden="true">⏳</span> : null}
      {children}
    </MantineButtonBase>
  );
}
