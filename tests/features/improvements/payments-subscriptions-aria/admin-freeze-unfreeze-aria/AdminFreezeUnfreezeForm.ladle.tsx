import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { AdminFreezeUnfreezeForm } from "@unveiled/app/components/payments/AdminFreezeUnfreezeForm";
import { LanguageContext } from "@unveiled/app/components/unveiled/context-primitives";

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

const meta = {
  component: Harness,
  parameters: { layout: "padded", ladle: { skipCoverage: true } },
  args: { language: "EN" as const, onSubmit: () => {} },
};

export default meta;

export const FreezeFormIsLabeledLandmark: Story<typeof Harness> = () => (
  <Harness language="EN" onSubmit={() => {}} />
);

export const MissingReasonIsAnnounced: Story<typeof Harness> = () => (
  <Harness language="EN" onSubmit={() => {}} />
);

export const FreezeFormLocalizes: Story<typeof Harness> = () => (
  <Harness language="DE" onSubmit={() => {}} />
);
