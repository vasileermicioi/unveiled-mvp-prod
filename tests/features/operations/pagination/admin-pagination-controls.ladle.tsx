import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  firstRowLabel: string;
  nextRowLabel: string;
  surface: "events" | "partners" | "members";
}

function PaginationControls({
  page,
  totalPages,
  pageSize,
  totalCount,
  firstRowLabel,
  nextRowLabel,
  surface,
}: PaginationControlsProps) {
  const heading = surface.charAt(0).toUpperCase() + surface.slice(1);
  return (
    <main className="grid gap-4 p-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight">{heading}</h1>
      <p className="text-sm opacity-70">
        Showing {pageSize} per page · page {page} of {totalPages} ({totalCount}{" "}
        total)
      </p>
      <table className="border-collapse border">
        <thead>
          <tr>
            <th className="border px-3 py-2 text-left">Identifier</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-3 py-2 font-mono">{firstRowLabel}</td>
          </tr>
          <tr>
            <td className="border px-3 py-2 font-mono">{nextRowLabel}</td>
          </tr>
        </tbody>
      </table>
      <nav className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          className="rounded border px-3 py-1"
        >
          Previous page
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          className="rounded border px-3 py-1"
        >
          Next page
        </button>
      </nav>
    </main>
  );
}

export default {
  component: PaginationControls,
  parameters: {
    layout: "fullscreen",
  },
};

export const Events: Story = () => (
  <PaginationControls
    surface="events"
    page={1}
    totalPages={4}
    pageSize={20}
    totalCount={65}
    firstRowLabel="pagination-event-001"
    nextRowLabel="pagination-event-021"
  />
);

export const Partners: Story = () => (
  <PaginationControls
    surface="partners"
    page={1}
    totalPages={3}
    pageSize={20}
    totalCount={42}
    firstRowLabel="Pagination Venue 001"
    nextRowLabel="Pagination Venue 021"
  />
);

export const Members: Story = () => (
  <PaginationControls
    surface="members"
    page={1}
    totalPages={3}
    pageSize={20}
    totalCount={50}
    firstRowLabel="smoke-admin-001@unveiled.local"
    nextRowLabel="smoke-member-004@unveiled.local"
  />
);
