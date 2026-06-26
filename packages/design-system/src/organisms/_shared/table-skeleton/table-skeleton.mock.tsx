import type { TableSkeletonProps } from "./table-skeleton";

export function makeMockTableSkeletonProps(
  overrides: Partial<TableSkeletonProps> = {},
): TableSkeletonProps {
  return {
    columns: 4,
    rows: 3,
    density: "comfortable",
    label: "Loading admin rows",
    ...overrides,
  };
}
