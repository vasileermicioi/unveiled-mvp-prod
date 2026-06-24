import {
  BookingModalActionsPresentational,
  BookingModalFormPresentational,
  BookingModalHeaderPresentational,
  BookingModalSummaryPresentational,
} from "./booking-modal";
import {
  makeMockBookingModalActionsProps,
  makeMockBookingModalFormProps,
  makeMockBookingModalHeaderProps,
  makeMockBookingModalSummaryProps,
} from "./booking-modal.mock";

export const HeaderDefault = () => (
  <BookingModalHeaderPresentational {...makeMockBookingModalHeaderProps()} />
);

export const SummaryDefault = () => (
  <BookingModalSummaryPresentational {...makeMockBookingModalSummaryProps()} />
);

export const FormDefault = () => (
  <BookingModalFormPresentational {...makeMockBookingModalFormProps()} />
);

export const FormCount2 = () => (
  <BookingModalFormPresentational
    {...makeMockBookingModalFormProps({ count: 2, totalValue: "8 credits" })}
  />
);

export const FormSubmitting = () => (
  <BookingModalFormPresentational
    {...makeMockBookingModalFormProps({ submitting: true })}
  />
);

export const FormDisabled = () => (
  <BookingModalFormPresentational
    {...makeMockBookingModalFormProps({ disabled: true })}
  />
);

export const ActionsDefault = () => (
  <BookingModalActionsPresentational {...makeMockBookingModalActionsProps()} />
);

export default {
  title: "Organisms / Bookings / Booking Modal",
  parameters: { ladle: { skipCoverage: true } },
};
