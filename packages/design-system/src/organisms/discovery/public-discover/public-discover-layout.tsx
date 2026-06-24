import { StatPanel } from "@unveiled/design-system";
import type { ReactElement } from "react";

export interface PublicDiscoverLayoutStat {
  label: string;
  value: string;
  caption?: string;
  className?: string;
}

export interface PublicDiscoverLayoutPartner {
  id: string;
  name: string;
  address: string;
  logoInitial: string;
}

export interface PublicDiscoverLayoutProps {
  copy: {
    activePartners: string;
    missingVenue: string;
    wantPartner: string;
    tellSupport: string;
  };
  stats: PublicDiscoverLayoutStat[];
  partners: PublicDiscoverLayoutPartner[];
  mailIcon: ReactElement;
  onTellSupport?: () => void;
}

export function PublicDiscoverLayoutPresentational(
  props: PublicDiscoverLayoutProps,
): ReactElement {
  const { copy, stats, partners, mailIcon, onTellSupport } = props;
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {stats.map((stat) => (
          <StatPanel
            key={stat.label}
            label={stat.label}
            value={stat.value}
            caption={stat.caption ?? ""}
            className={`h-full ${stat.className ?? ""}`.trim()}
          />
        ))}
      </div>
      <section className="border-4 border-brand-dark bg-white p-5 md:p-7 flex flex-col justify-between">
        <div>
          <p className="unveiled-meta opacity-60">{copy.activePartners}</p>
          <div className="mt-4 grid gap-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-3 border-4 border-brand-dark bg-brand-grey p-3"
              >
                <span className="grid size-10 place-items-center bg-brand-dark font-display text-lg font-black text-white">
                  {partner.logoInitial}
                </span>
                <span>
                  <span className="block text-xs font-black uppercase tracking-widest">
                    {partner.name}
                  </span>
                  <span className="block text-xs font-bold opacity-55">
                    {partner.address}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-4 border-brand-dark bg-brand-dark p-5 md:p-7 text-white flex flex-col justify-between">
        <div>
          <p className="unveiled-meta opacity-60">{copy.missingVenue}</p>
          <p className="headline-md mt-4">{copy.wantPartner}</p>
        </div>
        <button
          type="button"
          onClick={onTellSupport}
          className="mt-6 inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-brand-yellow px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-dark hover:text-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25 w-full justify-center"
        >
          {copy.tellSupport}
          <span className="ml-2 inline-flex">{mailIcon}</span>
        </button>
      </section>
    </section>
  );
}
