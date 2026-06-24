import { cn } from "../../../lib/utils";

export const listSkeletonVariants = [
  "events-grid",
  "saved-events",
  "bookings-list",
  "operations-table",
  "member-table",
] as const;

export type ListSkeletonVariant = (typeof listSkeletonVariants)[number];

export function isListSkeletonVariant(
  value: string,
): value is ListSkeletonVariant {
  return (listSkeletonVariants as readonly string[]).includes(value);
}

const VARIANT_ROW_COUNT: Record<ListSkeletonVariant, number> = {
  "events-grid": 8,
  "saved-events": 5,
  "bookings-list": 5,
  "operations-table": 6,
  "member-table": 6,
};

export interface ListSkeletonProps {
  variant: ListSkeletonVariant;
  label: string;
  className?: string;
}

export function ListSkeletonPresentational({
  variant,
  label,
  className,
}: ListSkeletonProps) {
  const rows = Array.from({ length: VARIANT_ROW_COUNT[variant] });

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
      data-skeleton-variant={variant}
      className={cn("grid gap-3", className)}
    >
      {rows.map((_, index) => (
        <div
          key={`skeleton-row-${variant}-${index.toString()}`}
          aria-hidden="true"
          className="h-4 w-full motion-safe:animate-pulse rounded bg-brand-dark/15"
        />
      ))}
    </div>
  );
}
