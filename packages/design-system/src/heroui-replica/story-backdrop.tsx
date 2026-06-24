// @ladle-only
import "../styles/global.css";
import type * as React from "react";

import { cn } from "../lib/utils";

import { HeroUIReplicaProvider } from "./provider";

export function storyBackdrop(children: React.ReactNode, className?: string) {
  return (
    <HeroUIReplicaProvider>
      <div
        className={cn(
          "min-h-[200px] bg-brand-grey p-8 unveiled-shadow",
          className,
        )}
      >
        {children}
      </div>
    </HeroUIReplicaProvider>
  );
}
