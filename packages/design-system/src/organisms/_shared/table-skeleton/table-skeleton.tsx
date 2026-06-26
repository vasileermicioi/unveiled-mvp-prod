import type * as React from "react";

import { cn } from "../../../lib/utils";

export type TableSkeletonDensity = "comfortable" | "compact";

export interface TableSkeletonProps {
  columns: number;
  rows: number;
  density?: TableSkeletonDensity;
  label?: string;
  className?: string;
}

const DENSITY_CLASSES: Record<TableSkeletonDensity, string> = {
  comfortable: "gap-4 py-3",
  compact: "gap-2 py-2",
};

export function TableSkeletonPresentational({
  columns,
  rows,
  density = "comfortable",
  label = "Loading table",
  className,
}: TableSkeletonProps) {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
      data-skeleton="table"
      className={cn(
        "grid w-full border-4 border-brand-dark bg-white",
        DENSITY_CLASSES[density],
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))` }}
    >
      {(() => {
        const cells: React.ReactElement[] = [];
        for (let rowIndex = 0; rowIndex < safeRows; rowIndex++) {
          for (let colIndex = 0; colIndex < safeColumns; colIndex++) {
            cells.push(
              <div
                key={`table-skeleton-${rowIndex}-${colIndex}`}
                aria-hidden="true"
                className={cn(
                  "ui-bf84c38c",
                  colIndex === 0 ? "h-5" : "h-4",
                  colIndex === safeColumns - 1 ? "w-3/4" : "w-full",
                )}
              />,
            );
          }
        }
        return cells;
      })()}
    </div>
  );
}
