import { cn } from "../../../lib/utils";

export interface ShellLogoProps {
  variant?: "black" | "white";
  className?: string;
}

export function ShellLogoPresentational({
  variant = "black",
  className,
}: ShellLogoProps) {
  return (
    <img
      src={variant ? `/app/logos/unveiled-logo-${variant}.svg` : undefined}
      alt="Unveiled"
      className={cn("h-7 w-auto md:h-9", className)}
    />
  );
}
