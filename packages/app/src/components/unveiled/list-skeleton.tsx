import type { UiLanguage } from "~/lib/i18n";
import { copyFor, type supportedLanguages } from "~/lib/i18n";
import { cn } from "@unveiled/design-system/lib/utils";

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

const SKELETON_KEYS = {
  "events-grid": "events-grid",
  "saved-events": "saved-events",
  "bookings-list": "bookings-list",
  "operations-table": "operations-table",
  "member-table": "member-table",
} as const satisfies Record<
  ListSkeletonVariant,
  keyof UiLanguage["shell"]["skeleton"]
>;

type SupportedLanguage = (typeof supportedLanguages)[number];

function resolveLanguage(
  language: string | null | undefined,
): SupportedLanguage {
  return language === "DE" ? "DE" : "EN";
}

export interface ListSkeletonProps {
  variant: ListSkeletonVariant;
  language?: string;
  className?: string;
}

export function ListSkeleton({
  variant,
  language,
  className,
}: ListSkeletonProps) {
  const lang = resolveLanguage(language);
  const label = copyFor(lang).shell.skeleton[SKELETON_KEYS[variant]];
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
          key={`${variant}-${index}`}
          aria-hidden="true"
          className="h-4 w-full motion-safe:animate-pulse rounded bg-brand-dark/15"
        />
      ))}
    </div>
  );
}

export type UiLanguageShape = UiLanguage;
