import "../../styles/global.css";
import { NextUIProvider } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../../lib/utils";

export function AtomStoryBackdrop({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NextUIProvider>
      <div
        className={cn(
          "flex min-h-[200px] flex-wrap items-center gap-4 bg-brand-grey p-8",
          className,
        )}
      >
        {children}
      </div>
    </NextUIProvider>
  );
}
