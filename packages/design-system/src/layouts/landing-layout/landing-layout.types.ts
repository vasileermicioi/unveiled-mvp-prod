import type { ReactNode } from "react";

export interface LandingLayoutProps {
  authenticated?: boolean;
  hero?: boolean;
  children?: ReactNode;
}
