import type { ShellStatusBannerProps } from "./shell-status-banner";

export function makeMockShellStatusBannerProps(
  overrides: Partial<ShellStatusBannerProps> = {},
): ShellStatusBannerProps {
  return {
    type: "error",
    title: "Live data could not be loaded",
    body: "The API Worker returned an error. Retry to refresh the dashboard.",
    actions: [
      {
        id: "retry",
        label: "Retry",
        onSelect: () => undefined,
        testId: "status-banner-retry",
      },
    ],
    ...overrides,
  };
}
