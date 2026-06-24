import {
  AdminPanelActionListPresentational,
  AdminPanelHeaderPresentational,
  AdminPanelTabBarPresentational,
} from "./admin-panel-header";
import {
  makeMockAdminPanelActionListProps,
  makeMockAdminPanelHeaderProps,
  makeMockAdminPanelTabBarProps,
} from "./admin-panel-header.mock";

export const HeaderDefault = () => (
  <AdminPanelHeaderPresentational {...makeMockAdminPanelHeaderProps()} />
);

export const TabBarMetrics = () => (
  <AdminPanelTabBarPresentational {...makeMockAdminPanelTabBarProps()} />
);

export const TabBarEvents = () => (
  <AdminPanelTabBarPresentational
    {...makeMockAdminPanelTabBarProps({ activeTab: "events" })}
  />
);

export const ActionListDefault = () => (
  <AdminPanelActionListPresentational
    {...makeMockAdminPanelActionListProps()}
  />
);

export default {
  title: "Organisms / Admin",
  parameters: { ladle: { skipCoverage: true } },
};
