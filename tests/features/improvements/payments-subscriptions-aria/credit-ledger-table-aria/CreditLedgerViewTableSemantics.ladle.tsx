import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { CreditLedgerViewTableSemantics } from "@unveiled/app/components/payments/CreditLedgerViewTableSemantics";
import { LanguageContext } from "@unveiled/app/components/unveiled/context-primitives";
import type { CreditLedgerEntryView } from "@unveiled/api/unveiled-view-models";

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

const meta = {
  component: Harness,
  parameters: { layout: "padded", ladle: { skipCoverage: true } },
  args: { language: "EN" as const, entries: sampleEntries },
};

export default meta;

export const PopulatedTableIsARegion: Story<typeof Harness> = () => (
  <Harness language="EN" entries={sampleEntries} />
);

export const EmptyLedgerKeepsRegion: Story<typeof Harness> = () => (
  <Harness language="EN" entries={[]} />
);
