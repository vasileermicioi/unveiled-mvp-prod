import { copyFor } from "@unveiled/api";
import {
  cn,
  ListSkeletonPresentational,
  type ListSkeletonProps,
  type ListSkeletonVariant,
} from "@unveiled/design-system";

const SKELETON_KEYS: Record<ListSkeletonVariant, string> = {
  "events-grid": "events-grid",
  "saved-events": "saved-events",
  "bookings-list": "bookings-list",
  "operations-table": "operations-table",
  "member-table": "member-table",
};

function resolveLanguage(language: string | null | undefined): "DE" | "EN" {
  return language === "DE" ? "DE" : "EN";
}

export function ListSkeleton({
  variant,
  language,
  className,
}: Omit<ListSkeletonProps, "label"> & { language?: string }) {
  const lang = resolveLanguage(language);
  const label =
    copyFor(lang).shell.skeleton[
      SKELETON_KEYS[variant] as keyof ReturnType<
        typeof copyFor
      >["shell"]["skeleton"]
    ];
  return (
    <ListSkeletonPresentational
      variant={variant}
      label={label}
      className={cn("ui-c7f94043", className)}
    />
  );
}

export {
  isListSkeletonVariant,
  ListSkeletonPresentational,
  listSkeletonVariants,
} from "@unveiled/design-system";
export type { ListSkeletonProps, ListSkeletonVariant };
