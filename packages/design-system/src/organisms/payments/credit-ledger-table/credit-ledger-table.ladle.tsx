import { CreditLedgerTablePresentational } from "./credit-ledger-table";
import { makeMockCreditLedgerTableProps } from "./credit-ledger-table.mock";

export const Default = () => (
  <CreditLedgerTablePresentational {...makeMockCreditLedgerTableProps()} />
);

export const Empty = () => (
  <CreditLedgerTablePresentational
    {...makeMockCreditLedgerTableProps({ entries: [] })}
  />
);

export default {
  title: "Organisms / Payments / Credit Ledger Table",
  parameters: { ladle: { skipCoverage: true } },
};
