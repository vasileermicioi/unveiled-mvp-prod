// @ladle-only
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type HeroTableShellProps = React.HTMLAttributes<HTMLDivElement>;

export function HeroTableShell({
  children,
  className,
  ...props
}: HeroTableShellProps) {
  return (
    <div
      className={cn(
        "overflow-hidden border-4 border-brand-dark bg-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type HeroTableRowProps = React.HTMLAttributes<HTMLDivElement>;

export function HeroTableRow({
  children,
  className,
  ...props
}: HeroTableRowProps) {
  return (
    <div
      className={cn(
        "grid gap-3 border-b-2 border-brand-dark/20 p-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Table as HeroTable,
  TableBody as HeroTableBody,
  TableCell as HeroTableCell,
  TableColumn as HeroTableColumn,
  TableHeader as HeroTableHeader,
  TableRow as HeroDataRow,
};
