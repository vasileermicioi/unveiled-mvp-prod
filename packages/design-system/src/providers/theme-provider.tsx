"use client";

import { NextUIProvider } from "@nextui-org/react";
import type { ReactNode } from "react";

export interface UnveiledThemeProviderProps {
  children: ReactNode;
}

export function UnveiledThemeProvider({
  children,
}: UnveiledThemeProviderProps) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
