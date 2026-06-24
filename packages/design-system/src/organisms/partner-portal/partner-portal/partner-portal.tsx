import { StatPanel } from "@unveiled/design-system";
import type { ReactElement, ReactNode } from "react";
import { Button } from "../../../atoms/button";

export interface PartnerPortalStatPanelData {
  label: string;
  value: string;
  caption: string;
}

export interface PartnerPortalHeaderCopy {
  portalBadge: string;
  addressUnavailable: string;
  venueQrLabel: string;
  missingTokenLabel: string;
}

export interface PartnerPortalHeaderProps {
  copy: PartnerPortalHeaderCopy;
  partnerName: string;
  partnerAddress: string | null;
  stats: PartnerPortalStatPanelData;
  qrIcon: ReactNode;
  checkIcon: ReactNode;
  venueQrUrl: string | null;
}

export function PartnerPortalHeaderPresentational(
  props: PartnerPortalHeaderProps,
): ReactElement {
  const {
    copy,
    partnerName,
    partnerAddress,
    stats,
    qrIcon,
    checkIcon,
    venueQrUrl,
  } = props;
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end border-4 border-brand-dark bg-white p-5 md:p-7">
      <div>
        <span className="inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-yellow px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark">
          {copy.portalBadge}
        </span>
        <h1 className="headline-lg mt-5">{partnerName}</h1>
        <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
          {partnerAddress ?? copy.addressUnavailable}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatPanel
          label={stats.label}
          value={stats.value}
          caption={stats.caption}
          className="h-full"
        />
        <section className="border-4 border-brand-dark bg-brand-cream p-5">
          <span className="inline-flex items-center justify-center size-8">
            {qrIcon}
          </span>
          <p className="mt-4 unveiled-meta">{copy.venueQrLabel}</p>
          {venueQrUrl ? (
            <Button
              type="button"
              variant="copied"
              className="mt-4 w-full h-auto whitespace-normal break-all text-left min-w-0"
            >
              <span className="inline-flex items-center justify-center shrink-0 size-4">
                {checkIcon}
              </span>
              <span className="min-w-0 break-all">{venueQrUrl}</span>
            </Button>
          ) : (
            <span className="mt-4 inline-flex items-center gap-1 border-2 border-brand-dark bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark">
              {copy.missingTokenLabel}
            </span>
          )}
        </section>
      </div>
    </section>
  );
}

export interface PartnerPortalFiltersCopy {
  searchGuestsLabel: string;
  placeholderSearch: string;
  eventLabel: string;
  allEventsLabel: string;
  downloadCsvLabel: string;
}

export interface PartnerPortalFiltersProps {
  copy: PartnerPortalFiltersCopy;
  searchValue: string;
  eventFilter: string;
  eventOptions: { id: string; title: string }[];
  searchInputId: string;
  eventSelectId: string;
  downloadIcon: ReactNode;
  onSearchChange: (value: string) => void;
  onEventChange: (value: string) => void;
  onDownload: () => void;
}

export function PartnerPortalFiltersPresentational(
  props: PartnerPortalFiltersProps,
): ReactElement {
  const {
    copy,
    searchValue,
    eventFilter,
    eventOptions,
    searchInputId,
    eventSelectId,
    downloadIcon,
    onSearchChange,
    onEventChange,
    onDownload,
  } = props;
  return (
    <section className="grid gap-4 md:grid-cols-[1fr_1fr_auto] border-4 border-brand-dark bg-white p-5">
      <div className="grid gap-2">
        <label className="unveiled-meta" htmlFor={searchInputId}>
          {copy.searchGuestsLabel}
        </label>
        <input
          id={searchInputId}
          placeholder={copy.placeholderSearch}
          value={searchValue}
          onChange={(event) =>
            onSearchChange((event.target as HTMLInputElement).value)
          }
          className="border-2 border-brand-dark bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-2">
        <label className="unveiled-meta" htmlFor={eventSelectId}>
          {copy.eventLabel}
        </label>
        <select
          id={eventSelectId}
          value={eventFilter}
          onChange={(event) =>
            onEventChange((event.target as HTMLSelectElement).value)
          }
          className="border-2 border-brand-dark bg-white px-3 py-2 text-sm"
        >
          <option value="">{copy.allEventsLabel}</option>
          {eventOptions.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="self-end inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25"
        onClick={onDownload}
      >
        <span className="inline-flex items-center justify-center size-4">
          {downloadIcon}
        </span>
        {copy.downloadCsvLabel}
      </button>
    </section>
  );
}

export interface PartnerPortalGuestRow {
  bookingId: string;
  name: string;
  email: string;
  eventTitle: string;
  statusBadge: ReactNode;
  actionButton: ReactNode;
}

export interface PartnerPortalListCopy {
  guestLabel: string;
  eventLabel: string;
  statusLabel: string;
  actionLabel: string;
  checkInStatusLabel: string;
  isLoading: boolean;
  isError: boolean;
  noGuestsTitle: string;
  dataLoadErrorText: string;
  emptyStateText: string;
  rows: PartnerPortalGuestRow[];
  checkInStatusMessage: string;
}

export function PartnerPortalListPresentational(
  props: PartnerPortalListCopy,
): ReactElement {
  const {
    guestLabel,
    eventLabel,
    statusLabel,
    actionLabel,
    isLoading,
    isError,
    noGuestsTitle,
    dataLoadErrorText,
    emptyStateText,
    rows,
    checkInStatusLabel,
    checkInStatusMessage,
  } = props;
  return (
    <section className="space-y-6">
      <section className="border-4 border-brand-dark bg-white">
        {isLoading ? (
          <>
            <GuestSkeletonRow />
            <GuestSkeletonRow />
            <GuestSkeletonRow />
          </>
        ) : rows.length === 0 ? (
          <section className="grid gap-2 p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-widest opacity-55">
              {noGuestsTitle}
            </p>
            <p className="text-xs font-bold opacity-70">
              {isError ? dataLoadErrorText : emptyStateText}
            </p>
          </section>
        ) : (
          rows.map((guest) => (
            <section
              key={guest.bookingId}
              className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.8fr_auto] md:items-center gap-4 border-t-2 border-brand-dark/10 p-4"
            >
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden">
                  {guestLabel}
                </span>
                <p className="text-sm font-black uppercase tracking-widest">
                  {guest.name}
                </p>
                <p className="text-xs font-bold opacity-55">{guest.email}</p>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden">
                  {eventLabel}
                </span>
                <p className="text-sm font-bold">{guest.eventTitle}</p>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden">
                  {statusLabel}
                </span>
                {guest.statusBadge}
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden mb-2">
                  {actionLabel}
                </span>
                {guest.actionButton}
              </div>
            </section>
          ))
        )}
      </section>
      <section className="border-4 border-brand-dark bg-brand-cream p-4">
        <p className="unveiled-meta">{checkInStatusLabel}</p>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest">
          {checkInStatusMessage}
        </p>
      </section>
    </section>
  );
}

function GuestSkeletonRow() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.8fr_auto] md:items-center gap-4 border-t-2 border-brand-dark/10 p-4">
      <div className="h-4 w-32 motion-safe:animate-pulse rounded bg-brand-dark/15" />
      <div className="h-4 w-48 motion-safe:animate-pulse rounded bg-brand-dark/15" />
      <div className="h-4 w-24 motion-safe:animate-pulse rounded bg-brand-dark/15" />
      <div className="h-8 w-32 motion-safe:animate-pulse rounded bg-brand-dark/15" />
    </section>
  );
}
