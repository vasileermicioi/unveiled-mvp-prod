import { ShellStatusBannerPresentational } from "./shell-status-banner";
import { makeMockShellStatusBannerProps } from "./shell-status-banner.mock";

export const Default = () => (
  <div className="space-y-6 bg-brand-grey p-8">
    <ShellStatusBannerPresentational {...makeMockShellStatusBannerProps()} />
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
          },
        ],
      })}
    />
  </div>
);

export default {
  title: "Organisms / Shared / Shell status banner",
  parameters: { ladle: { skipCoverage: true } },
};
