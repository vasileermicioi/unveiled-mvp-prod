import { Divider as HeroUIDivider } from "@nextui-org/react";

import { cn } from "../../lib/utils";
import "../../styles/atom-chrome.css";

export type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps) {
  return (
    <HeroUIDivider
      orientation="horizontal"
      className={cn("unveiled-divider", className)}
    />
  );
}
