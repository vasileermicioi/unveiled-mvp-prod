import type { PublicDiscoverProps } from "./public-discover";

export function makeMockPublicDiscoverProps(
  overrides: Partial<PublicDiscoverProps> = {},
): PublicDiscoverProps {
  return {
    header: (
      <div className="border-4 border-brand-dark bg-white p-5 md:p-7">
        <h1 className="headline-lg">Mock header</h1>
      </div>
    ),
    cards: (
      <div className="col-span-3 grid gap-5 lg:grid-cols-3">
        <div className="border-4 border-brand-dark bg-brand-grey p-5">
          Card 1
        </div>
        <div className="border-4 border-brand-dark bg-brand-grey p-5">
          Card 2
        </div>
        <div className="border-4 border-brand-dark bg-brand-grey p-5">
          Card 3
        </div>
      </div>
    ),
    pagination: (
      <div className="border-t-2 border-brand-dark pt-6 text-sm uppercase tracking-widest opacity-60">
        Mock pagination
      </div>
    ),
    layout: (
      <div className="border-4 border-brand-dark bg-brand-cream p-5">
        Mock layout (stats/partners/want-partner)
      </div>
    ),
    ...overrides,
  };
}
