import { CreditLedgerTablePresentational } from "@unveiled/design-system";
import { useContext } from "react";
import { LanguageContext } from "~/components/unveiled/context-primitives";
import { copyFor } from "~/lib/i18n";
import type { CreditLedgerEntryView } from "~/lib/unveiled-view-models";

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
  const noHistoryLabel = props.noHistoryLabel ?? copy.landmarkLabel;
  const emptyLabel = props.emptyLabel ?? copy.empty;
  const memberActorLabel =
    props.memberActorLabel ?? (language === "DE" ? "Mitglied" : "Member");

  return (
    <CreditLedgerTablePresentational
      regionLabel={noHistoryLabel}
      captionLabel={noHistoryLabel}
      columnReason={copy.columnReason}
      columnDate={copy.columnDate}
      columnActor={copy.columnActor}
      columnAmount={copy.columnAmount}
      emptyLabel={emptyLabel}
      memberActorLabel={memberActorLabel}
      entries={props.entries}
    />
  );
}
