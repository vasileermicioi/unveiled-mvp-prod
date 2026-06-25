import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";

interface PublicDiscoverPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  surface: "public";
}

function PublicDiscoverPagination({
  page,
  pageSize,
  totalCount,
  hasMore,
}: PublicDiscoverPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  return (
    <main className="grid gap-4 p-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight">
        Discover
      </h1>
      <p className="text-sm opacity-70">
        Showing {pageSize} per page · page {page} of {totalPages} (
        {totalCount} total)
      </p>
      <nav className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded border px-3 py-1"
        >
          Previous page
        </button>
        <span className="px-3 py-1 text-sm">Page {page} / {totalPages}</span>
        <button
          type="button"
          disabled={!hasMore}
          aria-label="Next page"
          className="rounded border px-3 py-1"
        >
          Next page
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span>Per page</span>
          <select
            aria-label="Items per page"
            defaultValue={String(pageSize)}
            className="rounded border px-2 py-1"
          >
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </label>
      </nav>
    </main>
  );
}

export default {
  component: PublicDiscoverPagination,
  parameters: {
    layout: "fullscreen",
  },
};

export const Default: Story = () => (
  <PublicDiscoverPagination
    surface="public"
    page={1}
    pageSize={6}
    totalCount={65}
    hasMore
  />
);

export const DeepLink: Story = () => (
  <PublicDiscoverPagination
    surface="public"
    page={3}
    pageSize={24}
    totalCount={65}
    hasMore={false}
  />
);

export const LastPage: Story = () => (
  <PublicDiscoverPagination
    surface="public"
    page={11}
    pageSize={6}
    totalCount={65}
    hasMore={false}
  />
);