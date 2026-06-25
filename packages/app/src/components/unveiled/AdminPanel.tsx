import { actions } from "astro:actions";
import {
  AdminPanelHeaderPresentational,
  AdminPanelTabBarPresentational,
  Badge,
  Button,
  Card,
  cn,
  Divider,
  Field,
  SelectInput,
  StatePanel,
  TextArea,
  TextInput,
} from "@unveiled/design-system";
import {
  ArrowDownToLine,
  ArrowLeft,
  ExternalLink,
  Plus,
  QrCode,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { AdminFreezeUnfreezeForm } from "~/components/payments/AdminFreezeUnfreezeForm";
import { ModalShell } from "~/components/unveiled/app-shell";
import {
  AdminAssetUploadField,
  downloadCsv,
  EventRowSkeleton,
  LanguageContext,
  MemberCardSkeleton,
  Pagination,
  PartnerRowSkeleton,
  runServerAction,
  StatPanel,
  useCopy,
  useLiveData,
} from "./context";

interface AdminPanelProps {
  initialTab?: string;
  membersPage: number;
  setMembersPage: (p: number) => void;
  membersPageSize: number;
  setMembersPageSize: (s: number) => void;
  partnersPage: number;
  setPartnersPage: (p: number) => void;
  partnersPageSize: number;
  setPartnersPageSize: (s: number) => void;
  eventsPage: number;
  setEventsPage: (p: number) => void;
  eventsPageSize: number;
  setEventsPageSize: (s: number) => void;
}

function scrollToAdminExport() {
  document
    .getElementById("admin-export-panel")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AdminPanel({
  initialTab = "metrics",
  membersPage,
  setMembersPage,
  membersPageSize,
  setMembersPageSize,
  partnersPage,
  setPartnersPage,
  partnersPageSize,
  setPartnersPageSize,
  eventsPage,
  setEventsPage,
  eventsPageSize,
  setEventsPageSize,
}: AdminPanelProps) {
  const selectedLanguage = useContext(LanguageContext);
  const copy = useCopy().admin;
  const live = useLiveData();
  const [adminMessage, setAdminMessage] = useState<string>(
    copy.adminMessageDefault,
  );
  useEffect(() => {
    setAdminMessage(copy.adminMessageDefault);
  }, [copy.adminMessageDefault]);

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const updateTab = (newTab: string) => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.pushState(null, "", url.pathname + url.search);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const currentTab = params.get("tab") || "metrics";
      if (["metrics", "events", "partners", "members"].includes(currentTab)) {
        setActiveTab(currentTab);
      } else {
        setActiveTab("metrics");
      }
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("admin-tab-change", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("admin-tab-change", handlePopState);
    };
  }, []);

  const [eventImageUrl, setEventImageUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: "event" | "partner";
    id: string;
    name: string;
  } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );
  const [eventFieldErrors, setEventFieldErrors] = useState<
    Record<string, string>
  >({});
  const [partnerFieldErrors, setPartnerFieldErrors] = useState<
    Record<string, string>
  >({});

  const editingEvent = useMemo(() => {
    if (!editingEventId) return null;
    return live.adminEvents.find((e) => e.id === editingEventId) ?? null;
  }, [live.adminEvents, editingEventId]);

  const editingPartner = useMemo(() => {
    if (!editingPartnerId) return null;
    return live.adminPartners.find((p) => p.id === editingPartnerId) ?? null;
  }, [live.adminPartners, editingPartnerId]);

  useEffect(() => {
    if (editingEvent) {
      setEventImageUrl(editingEvent.imageUrl || "");
      setTicketType(editingEvent.ticketType);
      setSecretCodeMode(editingEvent.secretCodeMode || "MANUAL");
    } else {
      setEventImageUrl("");
      setTicketType("SECRET_CODE");
      setSecretCodeMode("MANUAL");
    }
  }, [editingEvent]);

  useEffect(() => {
    if (editingPartner) {
      setPartnerLogoUrl(editingPartner.logoUrl || "");
    } else {
      setPartnerLogoUrl("");
    }
  }, [editingPartner]);

  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  useEffect(() => {
    if (memberSearchQuery !== undefined) {
      setMembersPage(1);
    }
  }, [memberSearchQuery, setMembersPage]);
  const [ticketType, setTicketType] = useState<"SECRET_CODE" | "VOUCHER">(
    "SECRET_CODE",
  );
  const [secretCodeMode, setSecretCodeMode] = useState<
    "MANUAL" | "SHARED_GENERATED" | "UNIQUE_PER_BOOKING"
  >("MANUAL");
  const [exportPartnerId, setExportPartnerId] = useState("");
  const [exportMessage, setExportMessage] = useState(
    "Select a partner to filter the booking export.",
  );

  const [seriesEnabled, setSeriesEnabled] = useState(false);
  const [seriesStartDate, setSeriesStartDate] = useState("2026-05-04");
  const [seriesEndDate, setSeriesEndDate] = useState("2026-05-30");
  const [seriesWeekdays, setSeriesWeekdays] = useState<string[]>([
    "Mon",
    "Wed",
    "Fri",
  ]);
  const [seriesTimes, setSeriesTimes] = useState("19:00, 21:00");
  const [seriesExcludedDates, setSeriesExcludedDates] = useState("2026-05-12");

  const computedSeries = useMemo(() => {
    try {
      const start = new Date(`${seriesStartDate}T00:00:00`);
      const end = new Date(`${seriesEndDate}T23:59:59`);
      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start > end
      ) {
        return { labels: [], isoStrings: [] };
      }

      const weekdayNamesShort = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
      ];
      const times = seriesTimes
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const excluded = seriesExcludedDates
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const labels: string[] = [];
      const isoStrings: string[] = [];
      const current = new Date(start);
      let limit = 100;
      while (current <= end && limit-- > 0) {
        const dayName = weekdayNamesShort[current.getDay()];
        const matchesWeekday = seriesWeekdays.some((w) => {
          const wLower = w.toLowerCase();
          return (
            wLower.includes(dayName.toLowerCase()) ||
            dayName.toLowerCase().includes(wLower)
          );
        });

        if (matchesWeekday) {
          const yyyy = current.getFullYear();
          const mm = String(current.getMonth() + 1).padStart(2, "0");
          const dd = String(current.getDate()).padStart(2, "0");
          const dateStr = `${yyyy}-${mm}-${dd}`;

          const isExcluded = excluded.some((ex) => {
            if (ex.includes("-")) return ex === dateStr;
            return (
              dateStr.includes(ex) || ex.includes(String(current.getDate()))
            );
          });

          if (!isExcluded) {
            for (const time of times) {
              const options: Intl.DateTimeFormatOptions = {
                weekday: "short",
                day: "2-digit",
                month: "short",
              };
              const dateLabel = current.toLocaleDateString("en-US", options);
              labels.push(`${dateLabel}, ${time}`);

              const [hours, minutes] = time.split(":").map(Number);
              const slotDate = new Date(current);
              slotDate.setHours(hours || 0, minutes || 0, 0, 0);
              isoStrings.push(slotDate.toISOString());
            }
          }
        }
        current.setDate(current.getDate() + 1);
      }
      return {
        labels: labels.slice(0, 8),
        isoStrings: isoStrings.slice(0, 8),
      };
    } catch (_e) {
      return { labels: [], isoStrings: [] };
    }
  }, [
    seriesStartDate,
    seriesEndDate,
    seriesWeekdays,
    seriesTimes,
    seriesExcludedDates,
  ]);

  const filteredMembers = useMemo(() => {
    const query = memberSearchQuery.toLowerCase().trim();
    if (!query) return live.adminMembers;
    return live.adminMembers.filter(
      (m) =>
        m.fullName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query),
    );
  }, [live.adminMembers, memberSearchQuery]);

  const handlePartnerExportClick = () => {
    updateTab("partners");
    setTimeout(() => {
      scrollToAdminExport();
    }, 50);
  };

  return (
    <div className="ui-e400b83c">
      <AdminPanelHeaderPresentational
        badge="Admin"
        title={copy.operationsOverview || "Operations overview."}
      />
      <AdminPanelTabBarPresentational
        tabs={(["metrics", "events", "partners", "members"] as const).map(
          (tab) => ({
            id: tab,
            label:
              copy.tabs?.[tab] ?? tab.charAt(0).toUpperCase() + tab.slice(1),
          }),
        )}
        activeTab={
          activeTab === "add-event"
            ? "events"
            : activeTab === "add-partner"
              ? "partners"
              : activeTab
        }
        onTabClick={updateTab}
      />
      {activeTab === "metrics" && (
        <div className="animate-in fade-in ui-1c863832">
          <div className="ui-60030e8d">
            <div>
              <h2 className="headline-md">Operational KPIs</h2>
              <p className="ui-8df1c4da">
                Overview of key business metrics, including active members,
                ticket bookings, and venue partners.
              </p>
            </div>
          </div>
          <div className="ui-3d7f24e3">
            {live.adminDashboardMetrics.map((metric) => (
              <StatPanel key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      )}
      {activeTab === "events" && (
        <div className="animate-in fade-in ui-1c863832">
          <div className="ui-60030e8d">
            <div>
              <h2 className="headline-md">Events registry</h2>
              <p className="ui-8df1c4da">
                Manage live drops, create series slots, and track capacity.
              </p>
            </div>
            <Button
              type="button"
              variant="yellow"
              onClick={() => {
                setEditingEventId(null);
                setEventFieldErrors({});
                updateTab("add-event");
              }}
            >
              New event
              <Plus />
            </Button>
          </div>
          <div className="admin-panel-table">
            {live.isLoading ? (
              <>
                <EventRowSkeleton />
                <EventRowSkeleton />
                <EventRowSkeleton />
              </>
            ) : live.adminEvents.length === 0 ? (
              <StatePanel
                title="No admin events"
                text={
                  live.isError
                    ? "Live admin data could not be loaded."
                    : "Admin event rows will appear after events are created."
                }
                state={live.isError ? "error" : "empty"}
              />
            ) : (
              live.adminEvents.map((event) => (
                <div
                  key={event.id}
                  className="admin-panel-row grid-cols-1 ui-dcdadbf5"
                >
                  <div>
                    <span className="ui-10d0083b">Event</span>
                    <p className="ui-8a48840f">{event.title}</p>
                    <p className="ui-600d3d0f">{event.partnerName}</p>
                  </div>
                  <div>
                    <span className="ui-10d0083b">Date</span>
                    <p className="ui-2eb25574">{event.dateLabel}</p>
                  </div>
                  <div>
                    <span className="ui-10d0083b">Capacity</span>
                    <p className="ui-2eb25574">{event.capacityLabel}</p>
                  </div>
                  <div>
                    <span className="ui-10d0083b">Details</span>
                    <p className="ui-da162047">
                      {event.codeStrategyLabel} {" // "}
                      {event.creditPrice} credits
                    </p>
                  </div>
                  <div>
                    <span className="ui-10d0083b">Status</span>
                    <div>
                      <Badge
                        tone={event.statusLabel === "Draft" ? "grey" : "yellow"}
                      >
                        {event.statusLabel}
                      </Badge>
                    </div>
                  </div>
                  <div className="ui-9bc94b54">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="ui-7306d872"
                      onClick={() => {
                        setEditingEventId(event.id);
                        setEventFieldErrors({});
                        updateTab("add-event");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="ui-7306d872"
                      onClick={() => {
                        setDeleteErrorMessage(null);
                        setDeleteConfirmTarget({
                          type: "event",
                          id: event.id,
                          name: event.title,
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
            {!live.isLoading && live.adminEvents.length > 0 && (
              <Pagination
                page={eventsPage}
                pageSize={eventsPageSize}
                totalCount={live.adminEventsTotal}
                hasMore={live.adminEventsHasMore}
                onPageChange={setEventsPage}
                onPageSizeChange={setEventsPageSize}
                className="ui-e64dbdf1"
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "add-event" && (
        <div className="animate-in fade-in ui-1c863832">
          <div className="ui-60030e8d">
            <div>
              <h2 className="headline-md">
                {editingEventId ? "Edit Event" : "New Event"}
              </h2>
              <p className="ui-8df1c4da">
                {editingEventId
                  ? "Modify an existing drop slot."
                  : "Create a new drop slot or series of events for members."}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingEventId(null);
                setEventFieldErrors({});
                updateTab("events");
              }}
            >
              <ArrowLeft />
              Back to Events
            </Button>
          </div>
          <div className="ui-9471e6c9">
            <Card
              key={editingEventId ?? "new"}
              id="admin-event-form"
              tone="white"
              shadow={false}
              className="scroll-mt-24 ui-b3fd4cbe"
              as="form"
              onChange={() => {
                if (Object.keys(eventFieldErrors).length > 0) {
                  setEventFieldErrors({});
                }
              }}
              onSubmit={async (event) => {
                event.preventDefault();
                if (eventSubmitting) return;
                const form = event.currentTarget as HTMLFormElement;
                if (!form.reportValidity()) {
                  setAdminMessage("Check the highlighted fields.");
                  return;
                }
                const formData = new FormData(form);
                setEventSubmitting(true);
                setAdminMessage(
                  editingEventId ? "Saving event..." : "Publishing event...",
                );

                const dateVal = String(formData.get("date") || "2026-05-04");
                const timeVal = String(formData.get("time") || "19:00");
                const [hours, minutes] = timeVal.split(":").map(Number);
                const startTimeMinutes =
                  (Number.isNaN(hours) ? 19 : hours) * 60 +
                  (Number.isNaN(minutes) ? 0 : minutes);
                const weekday = new Date(`${dateVal}T00:00:00`).getDay();

                const category = String(formData.get("category") || "Theater");
                const ticketTypeVal = String(
                  formData.get("ticketType") || "SECRET_CODE",
                ) as "SECRET_CODE" | "VOUCHER";
                const secretCodeModeVal = String(
                  formData.get("secretCodeMode") || "MANUAL",
                ) as "MANUAL" | "SHARED_GENERATED" | "UNIQUE_PER_BOOKING";
                const secretCodeVal = String(formData.get("secretCode") || "");
                const promoCodeVal = String(formData.get("promoCode") || "");
                const eventWebsiteUrlVal = String(
                  formData.get("eventWebsiteUrl") || "",
                );
                const languagesVal = formData.getAll("languages").map(String);
                const targetAgeGroupsVal = formData
                  .getAll("targetAgeGroups")
                  .map(String);
                const addressVal = String(formData.get("address") || "Berlin");
                const neighborhoodVal = String(
                  formData.get("neighborhood") || "Mitte",
                );

                await runServerAction(
                  () =>
                    actions.saveEvent({
                      id: editingEventId ?? undefined,
                      partnerId: String(
                        formData.get("partnerId") ||
                          live.adminPartners[0]?.id ||
                          "",
                      ),
                      title: String(formData.get("title") || ""),
                      description: String(formData.get("description") || ""),
                      category,
                      eventType: "Drop",
                      dateTime: `${dateVal}T${timeVal}:00.000Z`,
                      timingMode: "TIME_SLOT",
                      startTimeMinutes,
                      weekday,
                      address: addressVal,
                      neighborhood: neighborhoodVal,
                      imageUrl: String(formData.get("imageUrl") || ""),
                      tags: [],
                      creditPrice: Number(formData.get("credits") || 0),
                      totalCapacity: Number(formData.get("capacity") || 1),
                      ticketType: ticketTypeVal,
                      secretCodeMode:
                        ticketTypeVal === "SECRET_CODE"
                          ? secretCodeModeVal
                          : undefined,
                      secretCode:
                        ticketTypeVal === "SECRET_CODE" &&
                        secretCodeModeVal === "MANUAL"
                          ? secretCodeVal
                          : undefined,
                      promoCode:
                        ticketTypeVal === "VOUCHER" ? promoCodeVal : undefined,
                      eventWebsiteUrl:
                        ticketTypeVal === "VOUCHER"
                          ? eventWebsiteUrlVal
                          : undefined,
                      barrierFree: false,
                      languages: languagesVal,
                      targetAgeGroups: targetAgeGroupsVal,
                      series: {
                        enabled:
                          seriesEnabled && computedSeries.isoStrings.length > 0,
                        count:
                          seriesEnabled && computedSeries.isoStrings.length > 0
                            ? computedSeries.isoStrings.length
                            : 1,
                        intervalDays: 7,
                        slotIsoDateTimes: seriesEnabled
                          ? computedSeries.isoStrings
                          : [],
                      },
                    }),
                  setAdminMessage,
                  () => {
                    form.reset();
                    setEditingEventId(null);
                    setEventFieldErrors({});
                    setEventImageUrl("");
                    setTicketType("SECRET_CODE");
                    setSecretCodeMode("MANUAL");
                    setSeriesEnabled(false);
                    setSeriesWeekdays(["Mon", "Wed", "Fri"]);
                    live.refetchActiveSurface();
                    updateTab("events");
                  },
                  (errors) => {
                    setEventFieldErrors(errors ?? {});
                  },
                );
                setEventSubmitting(false);
              }}
            >
              <p className="headline-md">
                {editingEventId ? "Edit Event" : "Event form"}
              </p>
              <p className="ui-8df1c4da">{adminMessage}</p>
              <div className="ui-45d16817">
                <Field label="Title" error={eventFieldErrors.title}>
                  <TextInput
                    name="title"
                    placeholder="Event title"
                    defaultValue={editingEvent?.title ?? ""}
                    required
                  />
                </Field>
                <Field label="Partner" error={eventFieldErrors.partnerId}>
                  <SelectInput
                    name="partnerId"
                    defaultValue={editingEvent?.partnerId ?? ""}
                    required
                  >
                    {live.adminPartners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Date" error={eventFieldErrors.dateTime}>
                  <TextInput
                    name="date"
                    type="date"
                    defaultValue={
                      editingEvent?.dateTime
                        ? editingEvent.dateTime.split("T")[0]
                        : "2026-05-04"
                    }
                    required
                  />
                </Field>
                <Field label="Time" error={eventFieldErrors.dateTime}>
                  <TextInput
                    name="time"
                    type="time"
                    defaultValue={
                      editingEvent?.dateTime
                        ? editingEvent.dateTime.split("T")[1].slice(0, 5)
                        : "19:00"
                    }
                    required
                  />
                </Field>
                <Field label="Credits" error={eventFieldErrors.creditPrice}>
                  <TextInput
                    name="credits"
                    type="number"
                    min={0}
                    defaultValue={editingEvent?.creditPrice ?? 2}
                    required
                  />
                </Field>
                <Field label="Capacity" error={eventFieldErrors.totalCapacity}>
                  <TextInput
                    name="capacity"
                    type="number"
                    min={1}
                    defaultValue={editingEvent?.totalCapacity ?? 1}
                    required
                  />
                </Field>
                <Field label="Category" error={eventFieldErrors.category}>
                  <SelectInput
                    name="category"
                    defaultValue={editingEvent?.category ?? "Theater"}
                    required
                  >
                    <option value="Theater">Theater</option>
                    <option value="Kino">Kino</option>
                    <option value="Museum">Museum</option>
                    <option value="Ausstellung">Ausstellung</option>
                    <option value="Konzert">Konzert</option>
                    <option value="Kultur">Kultur</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Tanz/Performance">Tanz/Performance</option>
                    <option value="Talk/Lesung">Talk/Lesung</option>
                  </SelectInput>
                </Field>
                <Field label="Ticket Type" error={eventFieldErrors.ticketType}>
                  <SelectInput
                    name="ticketType"
                    value={ticketType}
                    onChange={(e) =>
                      setTicketType(
                        e.currentTarget.value as "SECRET_CODE" | "VOUCHER",
                      )
                    }
                    required
                  >
                    <option value="SECRET_CODE">
                      Workaround Password (SECRET_CODE)
                    </option>
                    <option value="VOUCHER">Promo Code (VOUCHER)</option>
                  </SelectInput>
                </Field>

                {ticketType === "VOUCHER" && (
                  <>
                    <Field
                      label="Promo Code"
                      error={eventFieldErrors.promoCode}
                    >
                      <TextInput
                        name="promoCode"
                        placeholder="Promo code"
                        defaultValue={editingEvent?.promoCode ?? ""}
                        required
                      />
                    </Field>
                    <Field
                      label="Event Website URL"
                      error={eventFieldErrors.eventWebsiteUrl}
                    >
                      <TextInput
                        name="eventWebsiteUrl"
                        type="url"
                        placeholder="https://..."
                        defaultValue={editingEvent?.eventWebsiteUrl ?? ""}
                        required
                      />
                    </Field>
                  </>
                )}
                {ticketType === "SECRET_CODE" && (
                  <>
                    <Field
                      label="Secret Code Mode"
                      error={eventFieldErrors.secretCodeMode}
                    >
                      <SelectInput
                        name="secretCodeMode"
                        value={secretCodeMode}
                        onChange={(e) =>
                          setSecretCodeMode(
                            e.currentTarget.value as
                              | "MANUAL"
                              | "SHARED_GENERATED"
                              | "UNIQUE_PER_BOOKING",
                          )
                        }
                        required
                      >
                        <option value="MANUAL">Manual</option>
                        <option value="SHARED_GENERATED">
                          Shared Generated
                        </option>
                        <option value="UNIQUE_PER_BOOKING">
                          Unique Per Booking
                        </option>
                      </SelectInput>
                    </Field>
                    {secretCodeMode === "MANUAL" && (
                      <Field
                        label="Secret Code"
                        error={eventFieldErrors.secretCode}
                      >
                        <TextInput
                          name="secretCode"
                          placeholder="Secret code"
                          defaultValue={editingEvent?.secretCode ?? ""}
                          required
                        />
                      </Field>
                    )}
                  </>
                )}

                <Field label="Address" error={eventFieldErrors.address}>
                  <TextInput
                    name="address"
                    defaultValue={editingEvent?.address ?? "Berlin"}
                    placeholder="Event address"
                    required
                  />
                </Field>
                <Field
                  label="Neighborhood"
                  error={eventFieldErrors.neighborhood}
                >
                  <TextInput
                    name="neighborhood"
                    defaultValue={editingEvent?.neighborhood ?? "Mitte"}
                    placeholder="Neighborhood (e.g. Mitte)"
                    required
                  />
                </Field>

                <Field
                  label="Languages"
                  className="ui-1cfa1776"
                  error={eventFieldErrors.languages}
                >
                  <div className="ui-ed2a159b">
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="languages"
                        value="DE"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.languages.includes("DE")
                            : true
                        }
                      />{" "}
                      DE
                    </label>
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="languages"
                        value="EN"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.languages.includes("EN")
                            : false
                        }
                      />{" "}
                      EN
                    </label>
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="languages"
                        value="TR"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.languages.includes("TR")
                            : false
                        }
                      />{" "}
                      Turki (TR)
                    </label>
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="languages"
                        value="AR"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.languages.includes("AR")
                            : false
                        }
                      />{" "}
                      Arabic (AR)
                    </label>
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="languages"
                        value="NON_VERBAL"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.languages.includes("NON_VERBAL")
                            : false
                        }
                      />{" "}
                      Non-Verbal
                    </label>
                  </div>
                </Field>

                <Field
                  label="Target Age Groups"
                  className="ui-1cfa1776"
                  error={eventFieldErrors.targetAgeGroups}
                >
                  <div className="ui-ed2a159b">
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="targetAgeGroups"
                        value="18-25"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.targetAgeGroups.includes("18-25")
                            : false
                        }
                      />{" "}
                      18-25
                    </label>
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="targetAgeGroups"
                        value="26-35"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.targetAgeGroups.includes("26-35")
                            : true
                        }
                      />{" "}
                      26-35
                    </label>
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="targetAgeGroups"
                        value="36-50"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.targetAgeGroups.includes("36-50")
                            : false
                        }
                      />{" "}
                      36-50
                    </label>
                    <label className="ui-4e0644ab">
                      <input
                        type="checkbox"
                        name="targetAgeGroups"
                        value="50+"
                        defaultChecked={
                          editingEvent
                            ? editingEvent.targetAgeGroups.includes("50+")
                            : false
                        }
                      />{" "}
                      50+
                    </label>
                  </div>
                </Field>
              </div>
              <Field label="Optional info" error={eventFieldErrors.description}>
                <TextArea
                  name="description"
                  placeholder="Door notes, redemption details, image alt text"
                  defaultValue={editingEvent?.description ?? ""}
                />
              </Field>
              <AdminAssetUploadField
                kind="event"
                label="Event image"
                ownerId="event-draft"
                value={eventImageUrl}
                onUrlChange={setEventImageUrl}
                testId="admin-event-image-upload"
                className="ui-1cfa1776"
              />
              <div className="ui-8f0ebda8">
                <Button type="submit" loading={eventSubmitting}>
                  {editingEventId ? "Save event" : "Publish event"}
                </Button>
              </div>
            </Card>
            <Card tone="cream" shadow={false} className="ui-3d231851">
              <div className="ui-f3472d20">
                <p className="headline-md">{copy.seriesBuilder}</p>
                <label className="ui-c5b342ea">
                  <input
                    type="checkbox"
                    checked={seriesEnabled}
                    onChange={(e) => setSeriesEnabled(e.target.checked)}
                    data-testid="admin-series-enabled-checkbox"
                    className="ui-c4637c8c"
                  />
                  <span>Publish as Event Series</span>
                </label>
              </div>
              <div
                className={cn("ui-2af82946", !seriesEnabled && "ui-219978c9")}
              >
                <Field label={`${copy.dateRange} (Start)`}>
                  <TextInput
                    type="date"
                    value={seriesStartDate}
                    onChange={(e) => setSeriesStartDate(e.currentTarget.value)}
                    disabled={!seriesEnabled}
                  />
                </Field>
                <Field label={`${copy.dateRange} (End)`}>
                  <TextInput
                    type="date"
                    value={seriesEndDate}
                    onChange={(e) => setSeriesEndDate(e.currentTarget.value)}
                    disabled={!seriesEnabled}
                  />
                </Field>
                <Field label={copy.weekdays} className="ui-1cfa1776">
                  <div className="ui-093b4b7f">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => {
                        const isChecked = seriesWeekdays.includes(day);
                        return (
                          <label key={day} className="ui-3b4589f7">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!seriesEnabled}
                              onChange={() => {
                                if (isChecked) {
                                  setSeriesWeekdays(
                                    seriesWeekdays.filter((d) => d !== day),
                                  );
                                } else {
                                  setSeriesWeekdays([...seriesWeekdays, day]);
                                }
                              }}
                            />
                            {day}
                          </label>
                        );
                      },
                    )}
                  </div>
                </Field>
                <Field label={copy.times}>
                  <TextInput
                    value={seriesTimes}
                    onChange={(e) => setSeriesTimes(e.currentTarget.value)}
                    placeholder="e.g. 19:00, 21:00"
                    disabled={!seriesEnabled}
                  />
                </Field>
                <Field label={copy.excludedDates}>
                  <TextInput
                    value={seriesExcludedDates}
                    onChange={(e) =>
                      setSeriesExcludedDates(e.currentTarget.value)
                    }
                    placeholder="e.g. 2026-05-12"
                    disabled={!seriesEnabled}
                  />
                </Field>
              </div>
              <div className="ui-9a3166fc">
                {seriesEnabled &&
                  computedSeries.labels.map((slot) => (
                    <Badge key={slot} tone="white">
                      {slot}
                    </Badge>
                  ))}
                {seriesEnabled && computedSeries.labels.length === 0 && (
                  <p className="ui-f4822063">No slots matching criteria</p>
                )}
                {!seriesEnabled && (
                  <p className="ui-f4822063">
                    Check "Publish as Event Series" to configure.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
      {activeTab === "partners" && (
        <div className="animate-in fade-in ui-1c863832">
          <div className="ui-60030e8d">
            <div>
              <h2 className="headline-md">Partners directory</h2>
              <p className="ui-8df1c4da">
                Manage partner venues, provision portal access, and rotate
                check-in tokens.
              </p>
            </div>
            <div className="app-page-toolbar">
              <Button
                type="button"
                variant="yellow"
                onClick={() => {
                  setEditingPartnerId(null);
                  setPartnerFieldErrors({});
                  updateTab("add-partner");
                }}
              >
                New partner
                <Plus />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePartnerExportClick}
              >
                Export Bookings
                <ArrowDownToLine />
              </Button>
            </div>
          </div>

          <div className="admin-panel-table">
            {live.isLoading ? (
              <>
                <PartnerRowSkeleton />
                <PartnerRowSkeleton />
                <PartnerRowSkeleton />
              </>
            ) : live.adminPartners.length === 0 ? (
              <StatePanel
                title="No partner venues"
                text="Admin partner rows will appear after partner venues are created."
                state="empty"
              />
            ) : (
              live.adminPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="admin-panel-row grid-cols-1 ui-3ea32e50"
                >
                  <div>
                    <span className="ui-10d0083b">Partner</span>
                    <p className="ui-8a48840f">{partner.name}</p>
                    <p className="ui-600d3d0f">
                      {partner.portalLoginLabel} {" // "}{" "}
                      {partner.venueQrTokenLabel}
                    </p>
                  </div>
                  <div>
                    <span className="ui-79d8b63e">Actions</span>
                    <div className="app-page-toolbar">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="ui-7306d872"
                        onClick={() => {
                          setEditingPartnerId(partner.id);
                          setPartnerFieldErrors({});
                          updateTab("add-partner");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="ui-7306d872"
                        onClick={() =>
                          void runServerAction(
                            () =>
                              actions.createPartnerPortalAccess({
                                partnerId: partner.id,
                                email: partner.contactEmail,
                              }),
                            setAdminMessage,
                            live.refetchActiveSurface,
                          )
                        }
                      >
                        <ExternalLink /> Portal
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="ui-7306d872"
                        onClick={() =>
                          void runServerAction(
                            () =>
                              actions.rotatePartnerVenueToken({
                                partnerId: partner.id,
                              }),
                            setAdminMessage,
                            live.refetchActiveSurface,
                          )
                        }
                      >
                        <QrCode /> QR
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="ui-7306d872"
                        onClick={() => {
                          setDeleteErrorMessage(null);
                          setDeleteConfirmTarget({
                            type: "partner",
                            id: partner.id,
                            name: partner.name,
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {!live.isLoading && live.adminPartners.length > 0 && (
              <Pagination
                page={partnersPage}
                pageSize={partnersPageSize}
                totalCount={live.adminPartnersTotal}
                hasMore={live.adminPartnersHasMore}
                onPageChange={setPartnersPage}
                onPageSizeChange={setPartnersPageSize}
                className="ui-e64dbdf1"
              />
            )}
          </div>

          <Card
            id="admin-export-panel"
            tone="cream"
            shadow={false}
            className="scroll-mt-24 ui-b3fd4cbe"
          >
            <p className="headline-md">Export Bookings</p>
            <p className="ui-8df1c4da">{exportMessage}</p>
            <div className="ui-b49bf65e">
              <Field label="Export partner" className="ui-bedf9403">
                <SelectInput
                  value={exportPartnerId}
                  onChange={(e) => setExportPartnerId(e.currentTarget.value)}
                >
                  <option value="">All partners</option>
                  {live.adminPartners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  void runServerAction(
                    () =>
                      actions.getAdminExportRows({
                        partnerId: exportPartnerId || undefined,
                      }),
                    setExportMessage,
                    (
                      data:
                        | { rows: Array<Record<string, unknown>> }
                        | undefined,
                    ) => {
                      const downloaded = downloadCsv(
                        "admin-bookings.csv",
                        data?.rows ?? [],
                        [
                          "bookingId",
                          "userId",
                          "event",
                          "partner",
                          "code",
                          "status",
                          "tickets",
                          "credits",
                          "createdAt",
                        ],
                      );
                      setExportMessage(
                        downloaded
                          ? "CSV export downloaded."
                          : "No export rows.",
                      );
                    },
                  )
                }
              >
                Download CSV
                <ArrowDownToLine />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "add-partner" && (
        <div className="animate-in fade-in ui-1c863832">
          <div className="ui-60030e8d">
            <div>
              <h2 className="headline-md">
                {editingPartnerId ? "Edit Partner" : "New Partner"}
              </h2>
              <p className="ui-8df1c4da">
                {editingPartnerId
                  ? "Modify an existing partner venue."
                  : "Register a new partner venue."}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingPartnerId(null);
                setPartnerFieldErrors({});
                updateTab("partners");
              }}
            >
              <ArrowLeft />
              Back to Partners
            </Button>
          </div>

          <Card
            key={editingPartnerId ?? "new"}
            id="admin-partner-form"
            tone="white"
            shadow={false}
            className="scroll-mt-24 ui-b3fd4cbe"
            as="form"
            onChange={() => {
              if (Object.keys(partnerFieldErrors).length > 0) {
                setPartnerFieldErrors({});
              }
            }}
            onSubmit={async (event) => {
              event.preventDefault();
              if (partnerSubmitting) return;
              const form = event.currentTarget as HTMLFormElement;
              if (!form.reportValidity()) {
                setAdminMessage("Check the highlighted fields.");
                return;
              }
              const formData = new FormData(form);
              setPartnerSubmitting(true);
              setAdminMessage("Saving partner...");
              await runServerAction(
                () =>
                  actions.savePartner({
                    id: editingPartnerId ?? undefined,
                    name: String(formData.get("name") || ""),
                    contactEmail: String(formData.get("contactEmail") || ""),
                    address: String(formData.get("address") || "Berlin"),
                    logoUrl: String(formData.get("logoUrl") || ""),
                  }),
                setAdminMessage,
                () => {
                  form.reset();
                  setEditingPartnerId(null);
                  setPartnerFieldErrors({});
                  setPartnerLogoUrl("");
                  live.refetchActiveSurface();
                  updateTab("partners");
                },
                (errors) => {
                  setPartnerFieldErrors(errors ?? {});
                },
              );
              setPartnerSubmitting(false);
            }}
          >
            <p className="headline-md">
              {editingPartnerId
                ? "Edit partner venue"
                : "Add new partner venue"}
            </p>
            <div className="ui-45d16817">
              <Field label="Venue name" error={partnerFieldErrors.name}>
                <TextInput
                  name="name"
                  placeholder="Venue name"
                  defaultValue={editingPartner?.name ?? ""}
                  required
                />
              </Field>
              <Field
                label="Contact email"
                error={partnerFieldErrors.contactEmail}
              >
                <TextInput
                  name="contactEmail"
                  type="email"
                  placeholder="partner@example.com"
                  defaultValue={editingPartner?.contactEmail ?? ""}
                  required
                />
              </Field>
              <Field
                label="Address"
                className="ui-1cfa1776"
                error={partnerFieldErrors.address}
              >
                <TextInput
                  name="address"
                  placeholder="Berlin"
                  defaultValue={editingPartner?.address ?? ""}
                  required
                />
              </Field>
            </div>
            <AdminAssetUploadField
              kind="partner"
              label="Partner logo"
              ownerId="partner-draft"
              value={partnerLogoUrl}
              onUrlChange={setPartnerLogoUrl}
              testId="admin-partner-logo-upload"
            />
            <div className="ui-8f0ebda8">
              <Button
                type="submit"
                variant="primary"
                loading={partnerSubmitting}
              >
                Save partner
              </Button>
            </div>
          </Card>
        </div>
      )}
      {activeTab === "members" && (
        <div className="animate-in fade-in ui-1c863832">
          <div className="ui-60030e8d">
            <div>
              <h2 className="headline-md">Member registry</h2>
              <p className="ui-8df1c4da">
                Review member preferences, billing status, and adjust booking
                credits.
              </p>
            </div>
          </div>

          <Card tone="cream" shadow={false} className="auth-stack">
            <div className="ui-f18be2a9">
              <Field label="Search members" className="ui-c0bddd0b">
                <TextInput
                  placeholder="Name or email"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.currentTarget.value)}
                />
              </Field>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  void runServerAction(
                    () => actions.listUsers({}),
                    setAdminMessage,
                    live.refetchActiveSurface,
                  )
                }
              >
                Refresh registry
              </Button>
            </div>
          </Card>

          <div className="auth-stack">
            {live.isLoading ? (
              <>
                <MemberCardSkeleton />
                <MemberCardSkeleton />
                <MemberCardSkeleton />
              </>
            ) : filteredMembers.length === 0 ? (
              <StatePanel
                title="No members found"
                text={
                  live.isError
                    ? "Live member rows could not be loaded."
                    : "No members match your search criteria or none signed up yet."
                }
                state={live.isError ? "error" : "empty"}
              />
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.userId} className="ui-b2b8b472">
                  <div className="ui-204f9214">
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: admin panel toggle */}
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: admin panel toggle */}
                    <div
                      className="ui-063b2c11"
                      onClick={() =>
                        setExpandedMemberId(
                          expandedMemberId === member.userId
                            ? null
                            : member.userId,
                        )
                      }
                    >
                      <div className="ui-00ebb85d">
                        <p className="ui-8a48840f">{member.fullName}</p>
                        <span className="ui-dd637d47">
                          {expandedMemberId === member.userId
                            ? "(Hide Intel)"
                            : "(Show Intel)"}
                        </span>
                      </div>
                      <p className="ui-600d3d0f">
                        {member.subscriptionStatusLabel} {" // "}
                        {member.credits} credits {" // "}
                        {member.roleLabel}
                      </p>
                      <p className="ui-115c9c32">
                        {member.email} {" // "}
                        {member.bookingCount} bookings {" // "}
                        {member.savedCount} saved {" // "}
                        {member.waitlistCount} waitlist
                      </p>
                      <p className="ui-115c9c32">
                        {member.providerStatus ?? "No provider"} {" // "}
                        {member.currentPeriodLabel} {" // "}
                        {member.historySummary}
                      </p>
                    </div>
                    <div className="ui-7c5144aa">
                      <div className="ui-c354e22d">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            void runServerAction(
                              () =>
                                actions.adjustMemberCredits({
                                  userId: member.userId,
                                  amount: 1,
                                  reason: "Admin panel adjustment",
                                  idempotencyKey: crypto.randomUUID(),
                                }),
                              setAdminMessage,
                              live.refetchActiveSurface,
                            )
                          }
                        >
                          + Credit
                        </Button>
                      </div>
                      <AdminFreezeUnfreezeForm
                        userId={member.userId}
                        isFrozen={member.billingOverrideActions.includes(
                          "freeze",
                        )}
                        resultMessage={adminMessage}
                        onSubmit={async (input) => {
                          await runServerAction(
                            () =>
                              actions.toggleUserFreeze({
                                userId: input.userId,
                                frozen: input.frozen,
                              }),
                            setAdminMessage,
                            live.refetchActiveSurface,
                          );
                        }}
                      />
                    </div>
                  </div>

                  {expandedMemberId === member.userId && (
                    <div className="ui-d5cabae9">
                      <div className="grid-cols-1 ui-0710d2a7">
                        <div className="auth-stack">
                          <div className="ui-8be98ec0">Preferences</div>
                          <div className="ui-e93697cc">
                            Age {member.preferences.ageGroup || "Unknown"} /
                            Radius {member.preferences.maxDistance}km /{" "}
                            {member.preferences.accessibility
                              ? "Accessible"
                              : "No accessibility flag"}
                          </div>
                          <div className="ui-b8ceaab1">
                            {[
                              {
                                label: "Interests",
                                values: member.preferences.interests,
                              },
                              {
                                label: "Moods",
                                values: member.preferences.moods,
                              },
                              {
                                label: "Districts",
                                values: member.preferences.districts,
                              },
                              {
                                label: "Timing",
                                values: member.preferences.preferredDays
                                  ? member.preferences.timing
                                  : [],
                              },
                              {
                                label: "Days",
                                values: member.preferences.preferredDays,
                              },
                              {
                                label: "Languages",
                                values: member.preferences.preferredLanguages,
                              },
                            ].map((group) => (
                              <div key={group.label} className="ui-27e6c432">
                                <div className="ui-04a3b34c">{group.label}</div>
                                <div className="ui-94a65763">
                                  {(group.values?.length
                                    ? group.values
                                    : ["None"]
                                  ).map((value) => (
                                    <Badge
                                      key={`${group.label}-${value}`}
                                      tone="white"
                                      className="ui-a3c18814"
                                    >
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="auth-stack">
                          <div className="ui-8be98ec0">History</div>
                          <div className="grid-cols-2 ui-73b06403">
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Bookings</div>
                              <div className="ui-6d76c1b3">
                                {member.bookingCount}
                              </div>
                            </div>
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Waitlist</div>
                              <div className="ui-6d76c1b3">
                                {member.waitlistCount}
                              </div>
                            </div>
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Saved</div>
                              <div className="ui-6d76c1b3">
                                {member.savedCount}
                              </div>
                            </div>
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Sessions</div>
                              <div className="ui-6d76c1b3">
                                {member.sessionCount}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="auth-stack">
                          <div className="ui-8be98ec0">Behavior Intel</div>
                          <div className="grid-cols-2 ui-73b06403">
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Event Opens</div>
                              <div className="ui-6d76c1b3">
                                {member.eventOpenCount}
                              </div>
                            </div>
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Filter Applies</div>
                              <div className="ui-6d76c1b3">
                                {member.filterApplyCount}
                              </div>
                            </div>
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Saves</div>
                              <div className="ui-6d76c1b3">
                                {member.savedCount}
                              </div>
                            </div>
                            <div className="ui-820d9618">
                              <div className="ui-dd637d47">Unsaves</div>
                              <div className="ui-6d76c1b3">
                                {member.unsavedCount}
                              </div>
                            </div>
                          </div>

                          <div className="ui-27e6c432">
                            <div className="ui-04a3b34c">Latest Signals</div>
                            <div className="ui-7d9ca3c3">
                              <div>
                                Last View: {member.lastView || "Unknown"}
                              </div>
                              <div>
                                Last Seen:{" "}
                                {member.lastSeenAt
                                  ? new Date(member.lastSeenAt).toLocaleString()
                                  : "Unknown"}
                              </div>
                              <div>
                                Last Booking:{" "}
                                {member.lastBookedEventId || "None"}
                              </div>
                              <div>
                                Last Waitlist:{" "}
                                {member.lastWaitlistedEventId || "None"}
                              </div>
                              <div>
                                Pref Update:{" "}
                                {member.preferencesUpdatedAt
                                  ? new Date(
                                      member.preferencesUpdatedAt,
                                    ).toLocaleString()
                                  : "Never"}
                              </div>
                            </div>
                          </div>

                          <div className="ui-26717177">
                            <div className="ui-04a3b34c">
                              Recently Touched Events
                            </div>
                            <div className="ui-94a65763">
                              {member.recentEventIds.length === 0 ? (
                                <span className="ui-dd637d47">
                                  No tracked event opens.
                                </span>
                              ) : (
                                member.recentEventIds.map((eventId) => {
                                  const matchingEvent =
                                    live.events.find((e) => e.id === eventId) ||
                                    live.adminEvents.find(
                                      (e) => e.id === eventId,
                                    );
                                  return (
                                    <Badge
                                      key={eventId}
                                      tone="yellow"
                                      className="ui-a3c18814"
                                    >
                                      {matchingEvent
                                        ? matchingEvent.title
                                        : eventId}
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Divider className="ui-4078b3ee" />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          void runServerAction(
                            () =>
                              actions.createAdminTicket({
                                userId: member.userId,
                                eventId: live.adminEvents[0]?.id ?? "",
                                ticketQuantity: 1,
                                consumeCapacity: true,
                                debitCredits: false,
                                idempotencyKey: crypto.randomUUID(),
                              }),
                            setAdminMessage,
                            live.refetchActiveSurface,
                          );
                        }}
                      >
                        Create ticket
                      </Button>
                      <p className="ui-7825411d">
                        History, preferences, bookings, and adjustment controls
                        are expandable.
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
            {!live.isLoading && live.adminMembers.length > 0 && (
              <Pagination
                page={membersPage}
                pageSize={membersPageSize}
                totalCount={live.adminMembersTotal}
                hasMore={live.adminMembersHasMore}
                onPageChange={setMembersPage}
                onPageSizeChange={setMembersPageSize}
              />
            )}
          </div>
        </div>
      )}
      {deleteConfirmTarget && (
        <ModalShell
          modal={{
            open: true,
            closeAvailable: !deleteSubmitting,
            logoVariant: "black",
            heading:
              deleteConfirmTarget.type === "event"
                ? copy.confirmDeleteEventHeading
                : copy.confirmDeletePartnerHeading,
            metadata:
              deleteConfirmTarget.type === "event"
                ? selectedLanguage === "DE"
                  ? "Operationen // Event löschen"
                  : "Operations // Delete Event"
                : selectedLanguage === "DE"
                  ? "Operationen // Partner löschen"
                  : "Operations // Delete Partner",
            layout: "single",
          }}
          language={selectedLanguage}
          onAction={(actionId) => {
            if (actionId === "close-modal" && !deleteSubmitting) {
              setDeleteConfirmTarget(null);
            }
          }}
        >
          <div className="ui-3ad7a596">
            <Card tone="white" shadow={false} className="form-shell">
              <p className="body-md ui-de598f1f">
                {deleteConfirmTarget.type === "event"
                  ? copy.confirmDeleteEventBody
                  : copy.confirmDeletePartnerBody}
              </p>
              {deleteErrorMessage && (
                <Card tone="cream" shadow={false} className="ui-dcbaf86e">
                  <p className="ui-02b025d9">{deleteErrorMessage}</p>
                </Card>
              )}
              <div className="ui-2c5eb4ee">
                <span className="ui-79b6860a">
                  {deleteConfirmTarget.type === "event"
                    ? copy.title
                    : copy.partner}
                </span>
                <p className="headline-sm ui-691c27fa">
                  {deleteConfirmTarget.name}
                </p>
              </div>
              <div className="ui-cbabe5f2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={deleteSubmitting}
                  onClick={() => setDeleteConfirmTarget(null)}
                >
                  {copy.cancel}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  loading={deleteSubmitting}
                  onClick={async () => {
                    setDeleteSubmitting(true);
                    setDeleteErrorMessage(null);
                    if (deleteConfirmTarget.type === "event") {
                      await runServerAction(
                        () =>
                          actions.deleteEvent({
                            eventId: deleteConfirmTarget.id,
                          }),
                        setAdminMessage,
                        () => {
                          live.refetchActiveSurface();
                          setDeleteConfirmTarget(null);
                        },
                        (_fieldErrors, formError) => {
                          setDeleteErrorMessage(
                            formError ??
                              (selectedLanguage === "DE"
                                ? "Die Anfrage konnte nicht abgeschlossen werden."
                                : "The request could not be completed."),
                          );
                        },
                      );
                    } else {
                      await runServerAction(
                        () =>
                          actions.deletePartner({
                            partnerId: deleteConfirmTarget.id,
                          }),
                        setAdminMessage,
                        () => {
                          live.refetchActiveSurface();
                          setDeleteConfirmTarget(null);
                        },
                        (_fieldErrors, formError) => {
                          setDeleteErrorMessage(
                            formError ??
                              (selectedLanguage === "DE"
                                ? "Die Anfrage konnte nicht abgeschlossen werden."
                                : "The request could not be completed."),
                          );
                        },
                      );
                    }
                    setDeleteSubmitting(false);
                  }}
                >
                  {copy.confirm}
                </Button>
              </div>
            </Card>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
