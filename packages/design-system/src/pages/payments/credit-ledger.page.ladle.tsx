import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { CreditLedgerTablePresentational } from "../../organisms/payments/credit-ledger-table/credit-ledger-table";
import { makeMockCreditLedgerTableProps } from "../../organisms/payments/credit-ledger-table/credit-ledger-table.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Credit ledger
        </h1>
      ),
      pageBody: (
        <CreditLedgerTablePresentational
          {...makeMockCreditLedgerTableProps()}
        />
      ),
    })}
  />
);

export default {
  title: "Pages / Payments / Credit ledger",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
