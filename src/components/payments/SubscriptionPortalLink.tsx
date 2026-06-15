import { useContext } from "react";

import { Panel } from "@/components/ui/unveiled-primitives";
import { copyFor } from "@/lib/i18n";

import { LanguageContext } from "@/components/unveiled/context";

export type SubscriptionPortalLinkProps = {
  url: string | null;
  active: boolean;
};

export function SubscriptionPortalLink(props: SubscriptionPortalLinkProps) {
  const language = useContext(LanguageContext);
  const copy = copyFor(language).payments.portal;
  const regionLabelId = "subscription-portal-region";
  const linkLabel = copy.linkLabel;

  if (!props.active) {
    return null;
  }

  return (
    <Panel
      as="section"
      tone="white"
      aria-labelledby={regionLabelId}
      className="space-y-3"
    >
      <h3 id={regionLabelId} className="sr-only">
        {copy.landmarkLabel}
      </h3>
      {props.url === null ? (
        <p
          className="text-xs font-bold uppercase tracking-widest opacity-70"
          role="status"
          aria-label={copy.missingFallback}
        >
          {copy.missingFallback}
        </p>
      ) : (
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={linkLabel}
          title={copy.linkHint}
          className="inline-flex items-center gap-2 border-4 border-brand-dark bg-white px-4 py-3 text-xs font-black uppercase tracking-widest"
        >
          {linkLabel}
          <span aria-hidden="true">{"↗"}</span>
        </a>
      )}
    </Panel>
  );
}
