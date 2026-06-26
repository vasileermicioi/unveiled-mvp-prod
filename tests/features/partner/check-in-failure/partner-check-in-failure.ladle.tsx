import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";

interface PartnerCheckInFailureProps {
  surface: "no-banner" | "error-banner" | "cleared-after-refetch";
  errorForBookingId?: string;
}

function PartnerCheckInFailure({
  surface,
  errorForBookingId,
}: PartnerCheckInFailureProps) {
  const rows = [
    { bookingId: "ok-1", name: "Guest 001", status: "CONFIRMED" },
    {
      bookingId: "cancelled-booking-1",
      name: "Guest 002",
      status: "CANCELLED_PENDING",
    },
    { bookingId: "ok-2", name: "Guest 003", status: "CONFIRMED" },
  ];

  return (
    <main className="grid gap-4 p-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight">
        Guest list
      </h1>
      <ul className="grid gap-3">
        {rows.map((row) => {
          const showBanner =
            surface === "error-banner" &&
            errorForBookingId === row.bookingId;
          return (
            <li
              key={row.bookingId}
              data-booking-id={row.bookingId}
              className="border-2 p-3"
            >
              {showBanner ? (
                <section
                  role="alert"
                  data-status-banner="error"
                  className="mb-3 border-4 border-[var(--unveiled-status-error)] bg-[var(--unveiled-status-error)] p-3"
                >
                  <p className="text-xs font-black uppercase tracking-widest">
                    Error
                  </p>
                  <p className="text-sm font-bold">
                    Booking is in CANCELLED_PENDING status.
                  </p>
                </section>
              ) : null}
              <p className="text-sm font-bold">{row.name}</p>
              <p className="text-xs opacity-70">{row.status}</p>
              <button
                type="button"
                className="mt-2 rounded border px-3 py-1 disabled:opacity-50"
              >
                Check in
              </button>
            </li>
          );
        })}
      </ul>
      <p data-surface={surface} hidden>
        surface:{surface}
      </p>
    </main>
  );
}

export default {
  component: PartnerCheckInFailure,
  parameters: {
    layout: "fullscreen",
  },
};

export const NoBanner: Story = () => (
  <PartnerCheckInFailure surface="no-banner" />
);

export const ErrorBanner: Story = () => (
  <PartnerCheckInFailure
    surface="error-banner"
    errorForBookingId="cancelled-booking-1"
  />
);

export const CancelledBooking: Story = () => (
  <PartnerCheckInFailure
    surface="error-banner"
    errorForBookingId="cancelled-booking-1"
  />
);

export const ClearedAfterRefetch: Story = () => (
  <PartnerCheckInFailure surface="cleared-after-refetch" />
);