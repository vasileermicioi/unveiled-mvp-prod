import { copyFor } from "@unveiled/api";
import {
  ListSkeletonPresentational,
  type ListSkeletonProps,
  type ListSkeletonVariant,
} from "@unveiled/design-system";
import { cn } from "@unveiled/design-system/lib/utils";

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
      className={cn("grid gap-3", className)}
    />
  );
}

export {
  isListSkeletonVariant,
  ListSkeletonPresentational,
  listSkeletonVariants,
} from "@unveiled/design-system";
export type { ListSkeletonProps, ListSkeletonVariant };
