import type { ReactNode } from "react";

export type ShellViewerContext = "guest" | "member" | "partner" | "admin";
export type ShellLanguage = "DE" | "EN";
export type ShellNavItemId =
  | "landing"
  | "discover"
  | "how"
  | "membership"
  | "faq"
  | "member"
  | "saved"
  | "bookings"
  | "profile"
  | "partner"
  | "admin";

export type ShellIconName =
  | "alert"
  | "bookmark"
  | "calendar"
  | "chevron-down"
  | "chevron-up"
  | "coins"
  | "filter"
  | "loader"
  | "lock"
  | "logout"
  | "map"
  | "settings"
  | "ticket"
  | "user"
  | "x";

export type ShellActionView = {
  id: string;
  label: string;
  targetHref?: string;
  icon?: ShellIconName;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  count?: number;
  ariaLabel?: string;
  variant?: "primary" | "secondary" | "yellow" | "ghost" | "muted" | "active";
};

export type ShellNavItemView = ShellActionView & {
  itemId: ShellNavItemId;
  collapseLabel?: boolean;
};

export type ShellLanguageToggleView = {
  selected: ShellLanguage;
  options: ShellLanguage[];
};

export type AppShellViewModel = {
  viewerContext: ShellViewerContext;
  activeItem: ShellNavItemId;
  logo: {
    variant: "black" | "white";
    alt: string;
  };
  language: ShellLanguageToggleView;
  tagline?: string;
  navItems: ShellNavItemView[];
  primaryAction?: ShellActionView;
  savedCount?: number;
  creditCount?: number;
  showProfile?: boolean;
  showLogout?: boolean;
};

export type ShellBreadcrumbView = {
  label: string;
  targetId?: string;
  current?: boolean;
};

export type ShellStatusTone = "notice" | "success" | "warning" | "error";

export type ShellStatusBannerView = {
  id: string;
  type: ShellStatusTone;
  label?: string;
  message: string;
  icon?: ShellIconName;
  supportEmail?: string;
  action?: ShellActionView;
  dismissible?: boolean;
};

export type ShellStateView = {
  state: "loading" | "error" | "empty";
  title: string;
  message: string;
  icon?: ShellIconName;
  retryAction?: ShellActionView;
  ctaAction?: ShellActionView;
};

export type PageShellViewModel = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  breadcrumbs?: ShellBreadcrumbView[];
  actions?: ShellActionView[];
  statuses?: ShellStatusBannerView[];
  state?: ShellStateView;
};

export type DiscoveryShellViewModel = {
  activeRangeLabel: string;
  visibleResultCount: number;
  resultCountLabel: string;
  filtersOpen: boolean;
  mapOpen: boolean;
  activeFilterCount: number;
  filterToggleLabel: string;
  mapToggleLabel: string;
  emptyState?: ShellStateView;
};

export type ModalShellViewModel = {
  open: boolean;
  closeAvailable: boolean;
  logoVariant: "black" | "white";
  heading?: string;
  metadata?: string;
  loading?: boolean;
  layout: "single" | "split";
};

export type ShellDemoView = {
  id: ShellNavItemId;
  label: string;
};

const publicNavItems: ShellNavItemView[] = [
  { id: "discover", itemId: "discover", label: "Discover" },
  { id: "how", itemId: "how", label: "How it works" },
  { id: "membership", itemId: "membership", label: "Membership" },
  { id: "faq", itemId: "faq", label: "FAQ" },
];

const memberNavItems: ShellNavItemView[] = [
  { id: "member", itemId: "member", label: "Current access" },
  { id: "faq", itemId: "faq", label: "FAQ" },
  {
    id: "saved",
    itemId: "saved",
    label: "Saved",
    icon: "bookmark",
    collapseLabel: true,
  },
  {
    id: "bookings",
    itemId: "bookings",
    label: "Bookings",
    icon: "ticket",
    collapseLabel: true,
  },
];

export const shellDemoViews: ShellDemoView[] = [
  { id: "landing", label: "Landing" },
  { id: "discover", label: "Discover" },
  { id: "how", label: "How it works" },
  { id: "faq", label: "FAQ" },
  { id: "member", label: "Member feed" },
  { id: "bookings", label: "Bookings" },
  { id: "profile", label: "Profile" },
  { id: "partner", label: "Partner" },
  { id: "admin", label: "Admin" },
];

export function createDemoShellViewModel(
  activeItem: ShellNavItemId,
  counts: { savedCount: number; creditCount: number },
): AppShellViewModel {
  const viewerContext: ShellViewerContext =
    activeItem === "partner"
      ? "partner"
      : activeItem === "admin"
        ? "admin"
        : ["member", "saved", "bookings", "profile"].includes(activeItem)
          ? "member"
          : "guest";

  const isGuest = viewerContext === "guest";
  const isMember = viewerContext === "member";
  const navItems = isGuest
    ? publicNavItems.map((item) => ({
        ...item,
        active: item.itemId === activeItem,
      }))
    : isMember
      ? memberNavItems.map((item) => ({
          ...item,
          active:
            item.itemId === activeItem ||
            (item.itemId === "member" && activeItem === "saved"),
          count: item.itemId === "saved" ? counts.savedCount : item.count,
        }))
      : [
          {
            id: viewerContext,
            itemId: viewerContext,
            label: viewerContext === "admin" ? "Admin" : "Partner",
            icon: "settings" as const,
            active: true,
          },
        ];

  return {
    viewerContext,
    activeItem,
    logo: { variant: "black", alt: "Unveiled" },
    language: { selected: "EN", options: ["DE", "EN"] },
    tagline: isGuest ? "Curated cultural access in Berlin" : undefined,
    navItems,
    primaryAction: isGuest
      ? {
          id: activeItem === "membership" ? "login" : "membership",
          label: activeItem === "membership" ? "Login" : "Become a member",
          variant: activeItem === "membership" ? "secondary" : "primary",
        }
      : undefined,
    savedCount: counts.savedCount,
    creditCount: isMember ? counts.creditCount : undefined,
    showProfile: isMember,
    showLogout: !isGuest,
  };
}

export const demoPageShells: Record<string, PageShellViewModel> = {
  public: {
    eyebrow: "Shared shell",
    title: "Target-native app frame",
    subtitle:
      "Page-specific content is supplied by the route while the shell owns spacing, breadcrumbs, actions, and state wrappers.",
    breadcrumbs: [
      { label: "Unveiled", targetId: "landing" },
      { label: "Discover", targetId: "discover" },
      { label: "Preview", current: true },
    ],
    actions: [
      { id: "refresh", label: "Refresh", icon: "loader", loading: false },
      { id: "open-map", label: "Map", icon: "map", count: 3 },
    ],
    statuses: [
      {
        id: "venue-check-in",
        type: "success",
        label: "Venue check-in",
        message: "Venue check-in registered successfully.",
        icon: "alert",
      },
    ],
  },
  member: {
    statuses: [
      {
        id: "membership",
        type: "warning",
        label: "Membership notice",
        message:
          "Your account has been frozen. Contact support@unveiled.berlin.",
        icon: "lock",
        supportEmail: "support@unveiled.berlin",
        action: { id: "support", label: "Contact support" },
      },
    ],
  },
  partner: {
    eyebrow: "Partner portal",
    title: "Kunsthalle Mitte",
    actions: [
      { id: "download", label: "Download codes", variant: "secondary" },
    ],
  },
  admin: {
    eyebrow: "Admin",
    title: "Operations overview",
    actions: [
      { id: "new-event", label: "New event", variant: "primary" },
      { id: "export", label: "Partner export", variant: "secondary" },
    ],
  },
};

export const demoShellStates: Record<string, ShellStateView> = {
  loading: {
    state: "loading",
    title: "Loading",
    message: "Shell state wrappers keep the page frame stable.",
    icon: "loader",
  },
  error: {
    state: "error",
    title: "Connection issue",
    message: "Retry actions stay inside the shared page container.",
    icon: "alert",
    retryAction: { id: "retry", label: "Retry" },
  },
  empty: {
    state: "empty",
    title: "No results",
    message: "Empty states keep their bordered high-contrast treatment.",
    ctaAction: { id: "reset", label: "Reset filters" },
  },
};

export const demoDiscoveryShell: DiscoveryShellViewModel = {
  activeRangeLabel: "Today",
  visibleResultCount: 3,
  resultCountLabel: "3 events visible",
  filtersOpen: true,
  mapOpen: false,
  activeFilterCount: 2,
  filterToggleLabel: "Filters",
  mapToggleLabel: "Explore city grid",
  emptyState: demoShellStates.empty,
};

export const demoModalShell: ModalShellViewModel = {
  open: true,
  closeAvailable: true,
  logoVariant: "black",
  heading: "Modal shell",
  metadata: "Booking flow // Shell layer",
  loading: false,
  layout: "split",
};

export type ShellSlot = ReactNode;
