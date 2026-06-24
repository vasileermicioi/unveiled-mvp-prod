export * from "./app-shell";
export * from "./shell-icon-button";
export * from "./shell-logo";
export * from "./shell-mobile-drawer";

import * as AppShell from "./app-shell";
import * as ShellIconButton from "./shell-icon-button";
import * as ShellLogo from "./shell-logo";
import * as ShellMobileDrawer from "./shell-mobile-drawer";

export const Shell = {
  ...AppShell,
  ...ShellIconButton,
  ...ShellLogo,
  ...ShellMobileDrawer,
} as const;
