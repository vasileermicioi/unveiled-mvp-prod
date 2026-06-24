import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import {
  BookingModalFormPresentational,
  BookingModalHeaderPresentational,
  BookingModalSummaryPresentational,
} from "../../organisms/bookings/booking-modal/booking-modal";
import {
  makeMockBookingModalFormProps,
  makeMockBookingModalHeaderProps,
  makeMockBookingModalSummaryProps,
} from "../../organisms/bookings/booking-modal/booking-modal.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageBody: (
        <div className="space-y-6">
          <BookingModalHeaderPresentational
            {...makeMockBookingModalHeaderProps()}
          />
          <BookingModalSummaryPresentational
            {...makeMockBookingModalSummaryProps()}
          />
          <BookingModalFormPresentational
            {...makeMockBookingModalFormProps()}
          />
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Bookings / Booking modal",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
