import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { AdminFreezeUnfreezeForm } from "@/components/payments/AdminFreezeUnfreezeForm";
import { LanguageContext } from "@/components/unveiled/context";

const Harness = ({
  language,
  onSubmit,
}: {
  language: "DE" | "EN";
  onSubmit: (input: {
    userId: string;
    frozen: boolean;
    reason: string;
  }) => void | Promise<void>;
}) => (
  <LanguageContext.Provider value={language}>
    <AdminFreezeUnfreezeForm
      userId="user-1"
      isFrozen={false}
      onSubmit={onSubmit}
    />
  </LanguageContext.Provider>
);

const meta: Meta<typeof Harness> = {
  title: "Unveiled/AdminFreezeUnfreezeForm",
  component: Harness,
  parameters: { layout: "padded" },
  args: { language: "EN", onSubmit: () => {} },
};

export default meta;
type Story = StoryObj<typeof Harness>;

export const FreezeFormIsLabeledLandmark: Story = {
  name: "Admin freeze form is a labeled landmark with a reason field and two unique submit buttons (EN)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", {
      name: /Freeze or unfreeze a member/i,
    });
    await expect(form).toBeInTheDocument();
    const reason = within(form).getByRole("textbox", { name: /Reason/i });
    await expect(reason).toBeInTheDocument();
    const freeze = within(form).getByRole("button", { name: /Freeze member/i });
    const unfreeze = within(form).getByRole("button", {
      name: /Unfreeze member/i,
    });
    await expect(freeze).toBeInTheDocument();
    await expect(unfreeze).toBeInTheDocument();
  },
};

export const MissingReasonIsAnnounced: Story = {
  name: "Submitting without a reason announces a localized error in the aria-live region",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", {
      name: /Freeze or unfreeze a member/i,
    });
    const freeze = within(form).getByRole("button", { name: /Freeze member/i });
    await freeze.click();
    const status = await canvas.findByRole("status", {
      name: /Admin action result/i,
    });
    await expect(status).toBeInTheDocument();
    await expect(status.textContent).toMatch(/A reason is required\./i);
  },
};

export const FreezeFormLocalizes: Story = {
  name: "Admin freeze form landmark and copy localize to German",
  args: { language: "DE" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", {
      name: /Mitglied einfrieren oder freigeben/i,
    });
    await expect(form).toBeInTheDocument();
    const reason = within(form).getByRole("textbox", {
      name: /Begründung/i,
    });
    await expect(reason).toBeInTheDocument();
  },
};
