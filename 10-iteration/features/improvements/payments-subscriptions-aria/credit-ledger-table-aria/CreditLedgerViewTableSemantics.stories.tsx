import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { CreditLedgerViewTableSemantics } from "@/components/payments/CreditLedgerViewTableSemantics";
import { LanguageContext } from "@/components/unveiled/context";
import type { CreditLedgerEntryView } from "@/lib/unveiled-view-models";

const sampleEntries: CreditLedgerEntryView[] = [
  {
    id: "ledger-1",
    amount: 10,
    direction: "credit",
    reasonLabel: "Monthly refill",
    providerLabel: "Stripe",
    invoiceReferenceLabel: "in_123",
    createdLabel: "2026-06-01",
  },
  {
    id: "ledger-2",
    amount: -1,
    direction: "debit",
    reasonLabel: "Booking",
    relatedLabel: "Kunsthalle Opening",
    actorLabel: "Member",
    createdLabel: "2026-06-04",
  },
];

const Harness = ({
  language,
  entries,
}: {
  language: "DE" | "EN";
  entries: ReadonlyArray<CreditLedgerEntryView>;
}) => (
  <LanguageContext.Provider value={language}>
    <CreditLedgerViewTableSemantics entries={entries} />
  </LanguageContext.Provider>
);

const meta: Meta<typeof Harness> = {
  title: "Unveiled/CreditLedgerViewTableSemantics",
  component: Harness,
  parameters: { layout: "padded" },
  args: { language: "EN", entries: sampleEntries },
};

export default meta;
type Story = StoryObj<typeof Harness>;

export const PopulatedTableIsARegion: Story = {
  name: "Populated credit ledger is a single table region with scoped column headers (EN)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: /Credit ledger/i });
    await expect(region).toBeInTheDocument();
    const table = within(region).getByRole("table", { name: /Credit ledger/i });
    await expect(table).toBeInTheDocument();
    const headers = within(table).getAllByRole("columnheader");
    await expect(headers.map((h) => h.textContent?.trim())).toEqual([
      "Reason",
      "Date",
      "Actor",
      "Credits",
    ]);
    const row = within(table).getByRole("row", { name: /in_123/ });
    await expect(row).toBeInTheDocument();
  },
};

export const EmptyLedgerKeepsRegion: Story = {
  name: "Empty credit ledger still exposes the region landmark with the empty-state copy",
  args: { entries: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: /Credit ledger/i });
    await expect(region).toBeInTheDocument();
    await expect(canvas.getByText(/The credit ledger is empty\./i)).toBeInTheDocument();
  },
};
