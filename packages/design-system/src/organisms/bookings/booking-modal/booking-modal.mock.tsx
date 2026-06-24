import type {
  BookingModalActionsProps,
  BookingModalFormProps,
  BookingModalHeaderProps,
  BookingModalSummaryProps,
} from "./booking-modal";

export function makeMockBookingModalHeaderProps(
  overrides: Partial<BookingModalHeaderProps> = {},
): BookingModalHeaderProps {
  return {
    categoryAndPartner: "Music // Donau115",
    title: "Late Night Jazz at Donau115",
    ...overrides,
  };
}

export function makeMockBookingModalSummaryProps(
  overrides: Partial<BookingModalSummaryProps> = {},
): BookingModalSummaryProps {
  return {
    description: "An intimate set from Berlin's most adventurous jazz quartet.",
    whenLabel: "WHEN",
    whenValue: "Fri 24 Oct · 21:00",
    whereLabel: "WHERE",
    whereValue: "Donau115, Kreuzberg",
    ...overrides,
  };
}

export function makeMockBookingModalFormProps(
  overrides: Partial<BookingModalFormProps> = {},
): BookingModalFormProps {
  return {
    ticketsLabel: "Tickets",
    totalLabel: "Total",
    totalValue: "4 credits",
    count: 1,
    minCount: 1,
    maxCount: 3,
    submitLabel: "Confirm booking",
    submitting: false,
    disabled: false,
    minusIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    plusIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    spinnerIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="9" strokeDasharray="42 42" />
      </svg>
    ),
    trailingIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="13 6 19 12 13 18" />
      </svg>
    ),
    onDecrement: () => undefined,
    onIncrement: () => undefined,
    onSubmit: () => undefined,
    ...overrides,
  };
}

export function makeMockBookingModalActionsProps(
  overrides: Partial<BookingModalActionsProps> = {},
): BookingModalActionsProps {
  return {
    returnLabel: "Back to feed",
    onReturn: () => undefined,
    ...overrides,
  };
}
