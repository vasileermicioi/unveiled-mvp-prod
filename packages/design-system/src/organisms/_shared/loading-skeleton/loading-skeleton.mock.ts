import type {
  ListSkeletonProps,
  ListSkeletonVariant,
} from "./loading-skeleton";

export function makeMockListSkeletonProps(
  overrides: Partial<ListSkeletonProps> = {},
): ListSkeletonProps {
  const variants: ListSkeletonVariant[] = [
    "events-grid",
    "saved-events",
    "bookings-list",
    "operations-table",
    "member-table",
  ];
  const fallbackVariant = variants[0] ?? "events-grid";
  return {
    variant: fallbackVariant,
    label: "Loading events",
    className: undefined,
    ...overrides,
  };
}
