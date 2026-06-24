import type { ReactElement } from "react";

export interface SubscriptionPortalLinkProps {
  active: boolean;
  url: string | null;
  linkLabel: string;
  linkHint: string;
  missingFallback: string;
  landmarkLabel: string;
}

export function SubscriptionPortalLinkPresentational(
  props: SubscriptionPortalLinkProps,
): ReactElement | null {
  const { active, url, linkLabel, linkHint, missingFallback, landmarkLabel } =
    props;
  if (!active) return null;
  const regionLabelId = "subscription-portal-region";
  return (
    <section
      aria-labelledby={regionLabelId}
      className="space-y-3 border-4 border-brand-dark bg-white p-4 md:p-6"
    >
      <h3 id={regionLabelId} className="sr-only">
        {landmarkLabel}
      </h3>
      {url === null ? (
        <p
          className="text-xs font-bold uppercase tracking-widest opacity-70"
          role="status"
          aria-label={missingFallback}
        >
          {missingFallback}
        </p>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={linkLabel}
          title={linkHint}
          className="inline-flex items-center gap-2 border-4 border-brand-dark bg-white px-4 py-3 text-xs font-black uppercase tracking-widest"
        >
          {linkLabel}
          <span aria-hidden="true">{"↗"}</span>
        </a>
      )}
    </section>
  );
}
