import type { ReactElement } from "react";

export interface CreditLedgerTableEntry {
  id: string;
  reasonLabel: string;
  relatedLabel?: string;
  createdLabel: string;
  actorLabel?: string;
  amount: number;
  invoiceReferenceLabel?: string;
}

export interface CreditLedgerTableProps {
  regionLabel: string;
  captionLabel: string;
  columnReason: string;
  columnDate: string;
  columnActor: string;
  columnAmount: string;
  emptyLabel: string;
  memberActorLabel: string;
  entries: ReadonlyArray<CreditLedgerTableEntry>;
}

export function CreditLedgerTablePresentational(
  props: CreditLedgerTableProps,
): ReactElement {
  const {
    regionLabel,
    captionLabel,
    columnReason,
    columnDate,
    columnActor,
    columnAmount,
    emptyLabel,
    memberActorLabel,
    entries,
  } = props;
  const regionLabelId = "credit-ledger-region";
  const captionId = "credit-ledger-caption";
  return (
    <section aria-labelledby={regionLabelId} className="space-y-3">
      <h3 id={regionLabelId} className="sr-only">
        {regionLabel}
      </h3>
      {entries.length === 0 ? (
        <section className="border-4 border-brand-dark bg-white p-5 md:p-7">
          <p className="text-sm font-bold uppercase tracking-widest opacity-55">
            {emptyLabel}
          </p>
        </section>
      ) : (
        <table
          aria-labelledby={regionLabelId}
          className="w-full border-4 border-brand-dark"
        >
          <caption id={captionId} className="sr-only">
            {captionLabel}
          </caption>
          <thead className="bg-brand-cream text-left">
            <tr>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {columnReason}
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {columnDate}
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {columnActor}
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {columnAmount}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                aria-label={entry.invoiceReferenceLabel ?? entry.id}
              >
                <th
                  scope="row"
                  className="px-4 py-2 text-left text-xs font-black uppercase"
                >
                  {entry.reasonLabel}
                  {entry.relatedLabel ? ` // ${entry.relatedLabel}` : ""}
                </th>
                <td className="px-4 py-2 text-xs">{entry.createdLabel}</td>
                <td className="px-4 py-2 text-xs">
                  {entry.actorLabel
                    ? `${memberActorLabel}: ${entry.actorLabel}`
                    : memberActorLabel}
                </td>
                <td className="px-4 py-2 text-xs font-black">
                  {entry.amount > 0 ? "+" : ""}
                  {entry.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
