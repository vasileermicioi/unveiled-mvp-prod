import { useContext } from "react";

import { Panel } from "@/components/ui/unveiled-primitives";
import { copyFor } from "@/lib/i18n";
import type { CreditLedgerEntryView } from "@/lib/unveiled-view-models";

import { LanguageContext } from "@/components/unveiled/context";

export type CreditLedgerViewTableSemanticsProps = {
  entries: ReadonlyArray<CreditLedgerEntryView>;
  noHistoryLabel?: string;
  emptyLabel?: string;
  memberActorLabel?: string;
};

export function CreditLedgerViewTableSemantics(
  props: CreditLedgerViewTableSemanticsProps,
) {
  const language = useContext(LanguageContext);
  const copy = copyFor(language).payments.ledger;
  const regionLabelId = "credit-ledger-region";
  const captionId = "credit-ledger-caption";
  const noHistoryLabel = props.noHistoryLabel ?? copy.landmarkLabel;
  const emptyLabel = props.emptyLabel ?? copy.empty;
  const memberActorLabel =
    props.memberActorLabel ??
    (language === "DE" ? "Mitglied" : "Member");

  return (
    <section
      aria-labelledby={regionLabelId}
      className="space-y-3"
    >
      <h3 id={regionLabelId} className="sr-only">
        {noHistoryLabel}
      </h3>
      {props.entries.length === 0 ? (
        <Panel tone="white">
          <p className="text-sm font-bold uppercase tracking-widest opacity-55">
            {emptyLabel}
          </p>
        </Panel>
      ) : (
        <table
          aria-labelledby={regionLabelId}
          className="w-full border-4 border-brand-dark"
        >
          <caption id={captionId} className="sr-only">
            {noHistoryLabel}
          </caption>
          <thead className="bg-brand-cream text-left">
            <tr>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {copy.columnReason}
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {copy.columnDate}
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {copy.columnActor}
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                {copy.columnAmount}
              </th>
            </tr>
          </thead>
          <tbody>
            {props.entries.map((entry) => (
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
