import { NextUIProvider } from "@nextui-org/react";
import type { PropsWithChildren } from "react";

export function HeroUIProvider({ children }: PropsWithChildren) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
