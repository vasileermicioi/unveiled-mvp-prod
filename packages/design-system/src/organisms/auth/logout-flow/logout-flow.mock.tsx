import type {
  LogoutFlowCopy,
  LogoutFlowPresentationalProps,
} from "./logout-flow";

export function makeMockLogoutFlowProps(
  overrides: Partial<LogoutFlowPresentationalProps> = {},
): LogoutFlowPresentationalProps {
  const copy: LogoutFlowCopy = {
    trigger: "Log out",
    menuLabel: "Account menu",
    profile: "Open profile",
    logOut: "Log out",
    logOutEverywhere: "Log out of all sessions",
  };
  return {
    copy,
    open: false,
    formId: "logout-flow-mock",
    onToggle: () => undefined,
    ...overrides,
  };
}
