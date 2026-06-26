import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { ShellStatusBannerPresentational } from "../../organisms/_shared/shell-status-banner/shell-status-banner";
import { makeMockShellStatusBannerProps } from "../../organisms/_shared/shell-status-banner/shell-status-banner.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Shell status banner
        </h1>
      ),
      pageBody: (
        <div className="space-y-6">
          <ShellStatusBannerPresentational
            {...makeMockShellStatusBannerProps()}
          />
          <ShellStatusBannerPresentational
            {...makeMockShellStatusBannerProps({
              type: "warning",
              title: "Showing cached data",
              body: "The latest fetch failed. The rows below may be out of date.",
              actions: [
                {
                  id: "retry",
                  label: "Retry",
                  onSelect: () => undefined,
                  testId: "status-banner-retry",
                },
              ],
            })}
          />
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Admin / Shell status banner",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
