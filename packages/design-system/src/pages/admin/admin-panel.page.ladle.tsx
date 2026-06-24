import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import {
  AdminPanelActionListPresentational,
  AdminPanelHeaderPresentational,
  AdminPanelTabBarPresentational,
} from "../../organisms/admin/admin-panel-header/admin-panel-header";
import {
  makeMockAdminPanelActionListProps,
  makeMockAdminPanelHeaderProps,
  makeMockAdminPanelTabBarProps,
} from "../../organisms/admin/admin-panel-header/admin-panel-header.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageBody: (
        <div className="space-y-8">
          <AdminPanelHeaderPresentational
            {...makeMockAdminPanelHeaderProps()}
          />
          <AdminPanelTabBarPresentational
            {...makeMockAdminPanelTabBarProps()}
          />
          <AdminPanelActionListPresentational
            {...makeMockAdminPanelActionListProps()}
          />
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Admin / Admin panel",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
