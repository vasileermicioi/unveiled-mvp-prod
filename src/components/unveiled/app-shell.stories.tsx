import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { AppShell } from "@/components/unveiled/app-shell";
import { createDemoShellViewModel } from "@/lib/app-shell-view-models";

const meta: Meta<typeof AppShell> = {
  title: "Unveiled/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    shell: createDemoShellViewModel("discover", {
      savedCount: 0,
      creditCount: 0,
    }),
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Guest: Story = {};

export const Member: Story = {
  args: {
    shell: createDemoShellViewModel("member", {
      savedCount: 3,
      creditCount: 10,
    }),
  },
};

export const Partner: Story = {
  args: {
    shell: createDemoShellViewModel("partner", {
      savedCount: 0,
      creditCount: 0,
    }),
  },
};

export const Admin: Story = {
  args: {
    shell: createDemoShellViewModel("admin", {
      savedCount: 0,
      creditCount: 0,
    }),
  },
};

export const HamburgerDisclosure: Story = {
  name: "Hamburger announces its open state",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hamburger = canvas.getByRole("button", {
      name: "Open navigation menu",
    });
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
    await expect(hamburger).toHaveAttribute(
      "aria-controls",
      "shell-mobile-drawer",
    );
  },
};

export const DrawerOpensAsDialog: Story = {
  name: "Mobile drawer opens as a modal dialog",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hamburger = canvas.getByRole("button", {
      name: "Open navigation menu",
    });
    await userEvent.click(hamburger);

    await expect(hamburger).toHaveAttribute("aria-expanded", "true");

    const drawer = canvas.getByRole("dialog");
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await expect(drawer).toHaveAttribute(
      "aria-labelledby",
      "shell-mobile-drawer-heading",
    );
    await expect(drawer).toHaveAttribute("id", "shell-mobile-drawer");

    const heading = canvas.getByText("Menu");
    await expect(heading).toHaveAttribute("id", "shell-mobile-drawer-heading");
  },
};

export const DrawerClosesViaCloseControl: Story = {
  name: "Mobile drawer closes via the localized close control",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hamburger = canvas.getByRole("button", {
      name: "Open navigation menu",
    });
    await userEvent.click(hamburger);

    const drawer = canvas.getByRole("dialog");
    await expect(drawer).toBeInTheDocument();

    const closeControl = canvas.getByRole("button", {
      name: "Close navigation menu",
    });
    await userEvent.click(closeControl);

    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  },
};

export const LanguageToggleExposesAriaPressed: Story = {
  name: "Language toggle exposes aria-pressed for the active option",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getAllByRole("group", { name: "Language" })[0];
    await expect(toggle).toBeInTheDocument();

    const de = within(toggle).getByRole("button", { name: "DE" });
    const en = within(toggle).getByRole("button", { name: "EN" });
    await expect(de).toHaveAttribute("aria-pressed", "false");
    await expect(en).toHaveAttribute("aria-pressed", "true");
  },
};
