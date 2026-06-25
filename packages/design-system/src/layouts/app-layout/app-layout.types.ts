import type { ReactNode } from "react";

export interface AppLayoutProps {
  header?: ReactNode;
  pageHeader?: ReactNode;
  pageBody?: ReactNode;
  pageAside?: ReactNode;
  children?: ReactNode;
}
