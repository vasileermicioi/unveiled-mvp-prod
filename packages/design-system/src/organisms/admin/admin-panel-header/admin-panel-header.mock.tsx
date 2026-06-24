import type {
  AdminPanelActionListEntry,
  AdminPanelActionListProps,
  AdminPanelHeaderProps,
  AdminPanelTabBarProps,
} from "./admin-panel-header";

export function makeMockAdminPanelHeaderProps(
  overrides: Partial<AdminPanelHeaderProps> = {},
): AdminPanelHeaderProps {
  return {
    badge: "Admin",
    title: "Operations overview.",
    ...overrides,
  };
}

export function makeMockAdminPanelTabBarProps(
  overrides: Partial<AdminPanelTabBarProps> = {},
): AdminPanelTabBarProps {
  return {
    tabs: [
      { id: "metrics", label: "Metrics" },
      { id: "events", label: "Events" },
      { id: "partners", label: "Partners" },
      { id: "members", label: "Members" },
    ],
    activeTab: "metrics",
    onTabClick: () => undefined,
    ...overrides,
  };
}

export function makeMockAdminPanelActionListProps(
  overrides: Partial<AdminPanelActionListProps> = {},
): AdminPanelActionListProps {
  const entries: AdminPanelActionListEntry[] = [
    { id: "add-event", label: "Add event", onSelect: () => undefined },
    { id: "add-partner", label: "Add partner", onSelect: () => undefined },
    { id: "export", label: "Export bookings", onSelect: () => undefined },
    { id: "freeze", label: "Freeze member", onSelect: () => undefined },
  ];
  return {
    entries,
    ...overrides,
  };
}
