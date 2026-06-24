import type {
  CreditLedgerTableEntry,
  CreditLedgerTableProps,
} from "./credit-ledger-table";

export function makeMockCreditLedgerTableProps(
  overrides: Partial<CreditLedgerTableProps> = {},
): CreditLedgerTableProps {
  const entries: CreditLedgerTableEntry[] = [
    {
      id: "e1",
      reasonLabel: "Monthly grant",
      createdLabel: "2026-01-01",
      amount: 10,
    },
    {
      id: "e2",
      reasonLabel: "Booked Late Night Jazz",
      relatedLabel: "Donau115",
      createdLabel: "2026-01-15",
      actorLabel: "Pat",
      amount: -4,
    },
  ];
  return {
    regionLabel: "Credit history",
    captionLabel: "All credit ledger entries for this member.",
    columnReason: "Reason",
    columnDate: "Date",
    columnActor: "Actor",
    columnAmount: "Amount",
    emptyLabel: "No credit history yet.",
    memberActorLabel: "Member",
    entries,
    ...overrides,
  };
}
