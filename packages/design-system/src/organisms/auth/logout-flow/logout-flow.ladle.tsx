import { LogoutFlowPresentational } from "./logout-flow";
import { makeMockLogoutFlowProps } from "./logout-flow.mock";

export const Default = () => (
  <LogoutFlowPresentational {...makeMockLogoutFlowProps()} />
);

export const MenuOpen = () => (
  <LogoutFlowPresentational {...makeMockLogoutFlowProps({ open: true })} />
);

export default {
  title: "Organisms / Auth / Logout Flow",
  parameters: { ladle: { skipCoverage: true } },
};
