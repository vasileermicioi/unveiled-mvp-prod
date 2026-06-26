import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";

interface GuestRow {
  bookingId: string;
  name: string;
  status: "CONFIRMED" | "USED" | "CANCELLED_PENDING";
}

interface PartnerGuestPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  rows: GuestRow[];
  surface: "default" | "used" | "page-size";
}

function PartnerGuestPagination({
  page,
  totalPages,
  pageSize,
  totalCount,
  rows,
  surface,
}: PartnerGuestPaginationProps) {
  return (
    <main className="grid gap-4 p-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight">Guest</h1>
      <p className="text-sm opacity-70">
        Showing {pageSize} per page · page {page} of {totalPages} ({totalCount}{" "}
        total)
      </p>
      <table className="border-collapse border">
        <thead>
          <tr>
            <th className="border px-3 py-2 text-left">Guest</th>
            <th className="border px-3 py-2 text-left">Status</th>
            <th className="border px-3 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.bookingId}>
              <td className="border px-3 py-2 font-mono">{row.name}</td>
              <td className="border px-3 py-2">
                {row.status === "USED" ? (
                  <span className="inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                    Already used
                  </span>
                ) : (
                  <span>{row.status}</span>
                )}
              </td>
              <td className="border px-3 py-2">
                <button
                  type="button"
                  disabled={row.status === "USED"}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Check in
                </button>
              </td>
            </tr>
          ))}
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
      <p data-surface={surface} hidden>
        surface:{surface}
      </p>
    </main>
  );
}

export default {
  component: PartnerGuestPagination,
  parameters: {
    layout: "fullscreen",
  },
};

export const DefaultPage: Story = () => (
  <PartnerGuestPagination
    surface="default"
    page={1}
    totalPages={3}
    pageSize={20}
    totalCount={42}
    rows={[
      { bookingId: "used-booking-1", name: "Smoke Guest 001", status: "USED" },
      {
        bookingId: "active-1",
        name: "Smoke Guest 002",
        status: "CONFIRMED",
      },
    ]}
  />
);

export const AlreadyUsed: Story = () => (
  <PartnerGuestPagination
    surface="used"
    page={1}
    totalPages={1}
    pageSize={20}
    totalCount={1}
    rows={[
      { bookingId: "used-booking-1", name: "Smoke Guest 001", status: "USED" },
    ]}
  />
);

export const PageSizeChange: Story = () => (
  <PartnerGuestPagination
    surface="page-size"
    page={1}
    totalPages={1}
    pageSize={50}
    totalCount={42}
    rows={[
      {
        bookingId: "active-1",
        name: "Smoke Guest 001",
        status: "CONFIRMED",
      },
    ]}
  />
);