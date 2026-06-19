// @ladle-only
import { NextUIProvider } from "@nextui-org/react";
import type * as React from "react";

export function HeroUIReplicaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
