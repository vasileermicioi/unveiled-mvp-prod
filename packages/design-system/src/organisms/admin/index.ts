export * from "./admin-panel-header";

import * as AdminPanelHeader from "./admin-panel-header";

export const Admin = {
  ...AdminPanelHeader,
} as const;
