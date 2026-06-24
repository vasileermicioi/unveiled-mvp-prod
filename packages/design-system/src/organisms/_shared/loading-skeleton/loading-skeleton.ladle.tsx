import { ListSkeletonPresentational } from "./loading-skeleton";
import { makeMockListSkeletonProps } from "./loading-skeleton.mock";

export const Default = () => (
  <ListSkeletonPresentational {...makeMockListSkeletonProps()} />
);

export const EventsGrid = () => (
  <ListSkeletonPresentational
    {...makeMockListSkeletonProps({ variant: "events-grid" })}
  />
);

export const SavedEvents = () => (
  <ListSkeletonPresentational
    {...makeMockListSkeletonProps({ variant: "saved-events" })}
  />
);

export const BookingsList = () => (
  <ListSkeletonPresentational
    {...makeMockListSkeletonProps({ variant: "bookings-list" })}
  />
);

export const OperationsTable = () => (
  <ListSkeletonPresentational
    {...makeMockListSkeletonProps({ variant: "operations-table" })}
  />
);

export const MemberTable = () => (
  <ListSkeletonPresentational
    {...makeMockListSkeletonProps({ variant: "member-table" })}
  />
);

export const German = () => (
  <ListSkeletonPresentational
    {...makeMockListSkeletonProps({
      variant: "events-grid",
      label: "Veranstaltungen werden geladen",
    })}
  />
);

export default {
  title: "Organisms / Shared / Loading Skeleton",
  parameters: { ladle: { skipCoverage: true } },
};
