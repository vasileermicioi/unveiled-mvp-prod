import { ShellMobileDrawerPresentational } from "./shell-mobile-drawer";
import { makeMockShellMobileDrawerProps } from "./shell-mobile-drawer.mock";

export const Open = () => (
  <ShellMobileDrawerPresentational
    {...makeMockShellMobileDrawerProps({ open: true })}
  />
);

export const Closed = () => (
  <ShellMobileDrawerPresentational
    {...makeMockShellMobileDrawerProps({ open: false })}
  />
);

export const WithoutFooter = () => (
  <ShellMobileDrawerPresentational
    {...makeMockShellMobileDrawerProps({ footer: undefined })}
  />
);

export const WithCustomChildren = () => (
  <ShellMobileDrawerPresentational
    {...makeMockShellMobileDrawerProps({
      children: (
        <div className="text-sm font-bold uppercase tracking-widest opacity-60">
          Custom nav items
        </div>
      ),
    })}
  />
);

export default {
  title: "Organisms / Shell / Mobile Drawer",
  parameters: { ladle: { skipCoverage: true } },
};
