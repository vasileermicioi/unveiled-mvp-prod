import type { Story } from "@ladle/react";
import { AppShell } from "~/components/unveiled/app-shell";
import { createDemoShellViewModel } from "~/lib/app-shell-view-models";

import "~/styles/global.css";

export default {
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    ladle: {
      skipCoverage: true,
    },
  },
};

export const Guest: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("discover", {
      savedCount: 0,
      creditCount: 0,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Demo content for the discover page.</div>
  </AppShell>
);

export const Member: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("member", {
      savedCount: 3,
      creditCount: 10,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Demo content for the member dashboard.</div>
  </AppShell>
);

export const Partner: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("partner", {
      savedCount: 0,
      creditCount: 0,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Demo content for the partner console.</div>
  </AppShell>
);

export const Admin: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("admin", {
      savedCount: 0,
      creditCount: 0,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Demo content for the admin console.</div>
  </AppShell>
);

export const HamburgerDisclosure: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("discover", {
      savedCount: 0,
      creditCount: 0,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Hamburger disclosure demo.</div>
  </AppShell>
);

export const DrawerOpensAsDialog: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("discover", {
      savedCount: 0,
      creditCount: 0,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Drawer-opens-as-dialog demo.</div>
  </AppShell>
);

export const DrawerClosesViaCloseControl: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("discover", {
      savedCount: 0,
      creditCount: 0,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Drawer-closes-via-close-control demo.</div>
  </AppShell>
);

export const LanguageToggleExposesAriaPressed: Story = () => (
  <AppShell
    shell={createDemoShellViewModel("discover", {
      savedCount: 0,
      creditCount: 0,
    })}
    onAction={() => {}}
  >
    <div className="ui-c4328367">Language toggle aria-pressed demo.</div>
  </AppShell>
);
