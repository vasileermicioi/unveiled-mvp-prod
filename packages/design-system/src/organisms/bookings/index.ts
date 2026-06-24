export * from "./booking-modal";

import * as BookingModal from "./booking-modal";

export const Bookings = {
  ...BookingModal,
} as const;
