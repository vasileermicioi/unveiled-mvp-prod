import { SubscriptionPortalLinkPresentational } from "@unveiled/design-system";
import { useContext } from "react";
import { LanguageContext } from "~/components/unveiled/context-primitives";
import { copyFor } from "~/lib/i18n";

export type SubscriptionPortalLinkProps = {
  url: string | null;
  active: boolean;
};

export function SubscriptionPortalLink(props: SubscriptionPortalLinkProps) {
  const language = useContext(LanguageContext);
  const copy = copyFor(language).payments.portal;
  return (
    <SubscriptionPortalLinkPresentational
      active={props.active}
      url={props.url}
      linkLabel={copy.linkLabel}
      linkHint={copy.linkHint}
      missingFallback={copy.missingFallback}
      landmarkLabel={copy.landmarkLabel}
    />
  );
}
