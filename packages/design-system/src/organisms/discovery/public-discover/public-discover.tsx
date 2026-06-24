import type { ReactElement, ReactNode } from "react";

export interface PublicDiscoverProps {
  header: ReactNode;
  layout: ReactNode;
  cards: ReactNode;
  pagination?: ReactNode;
}

export function PublicDiscoverPresentational({
  header,
  cards,
  pagination,
  layout,
}: PublicDiscoverProps): ReactElement {
  return (
    <div className="space-y-6">
      {header}
      <div className="space-y-10 py-8">
        <section className="grid gap-5 lg:grid-cols-3">{cards}</section>
        {pagination}
        {layout}
      </div>
    </div>
  );
}
