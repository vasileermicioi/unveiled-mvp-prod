import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

export interface ShellIconButtonProps {
  children: ReactNode;
  "aria-label": string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}

export function ShellIconButtonPresentational({
  children,
  onClick,
  className,
  size = "md",
  ...ariaProps
}: ShellIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaProps["aria-label"]}
      aria-expanded={ariaProps["aria-expanded"]}
      aria-controls={ariaProps["aria-controls"]}
      className={cn(
        "flex items-center justify-center border-2 border-brand-dark bg-white hover:bg-brand-cream transition-colors text-brand-dark",
        "size-9 md:size-10",
        className,
      )}
    >
      {children}
    </button>
  );
}
