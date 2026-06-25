import { actions } from "astro:actions";
import {
  Button,
  Card,
  cn,
  Field,
  SelectInput,
  StatPanel,
  TextInput,
} from "@unveiled/design-system";
import { ArrowLeft, ArrowRight, Upload as UploadIcon } from "lucide-react";
import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LanguageContext,
  LiveDataContext,
} from "~/components/unveiled/context-primitives";
import { APP_BASE_PREFIX, stripAppBase } from "~/lib/app-base";
import {
  type AppShellViewModel,
  createDemoShellViewModel,
  demoPageShells,
  shellDemoViews,
} from "~/lib/app-shell-view-models";
import {
  useAdminDataQuery,
  useMemberDataQuery,
  usePartnerDataQuery,
  usePublicDiscoveryQuery,
} from "~/lib/data-access/hooks";
import {
  createLiveDataView,
  emptyPublicData,
  type LiveDataView,
} from "~/lib/data-access/live-view-adapters";
import type { DiscoveryFilters } from "~/lib/data-access/query-keys";
import type { InitialSurfaceData } from "~/lib/data-access/surface-data";
import { copyFor, type UiLanguage } from "~/lib/i18n";
import type { EventCardView } from "~/lib/unveiled-view-models";

export type { LiveDataView } from "~/components/unveiled/context-primitives";
export {
  emptyLiveDataView,
  LanguageContext,
  LiveDataContext,
  useCopy,
  useLiveData,
} from "~/components/unveiled/context-primitives";

export { StatPanel };

export type View = Extract<
  ShellNavItemId,
  | "landing"
  | "discover"
  | "how"
  | "membership"
  | "faq"
  | "member"
  | "onboarding"
  | "bookings"
  | "profile"
  | "partner"
  | "admin"
>;

type ShellNavItemId =
  | AppShellViewModel["navItems"][number]["itemId"]
  | "landing"
  | "onboarding";

export type AuthLandingValues = {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  callbackURL?: string;
};

export type AuthEndpointResult = {
  ok: boolean;
  state?: {
    message?: string;
  };
  nextPath?: string;
};

export const onboardingPreferenceOptions = {
  interests: [
    "Theater",
    "Kino",
    "Museum",
    "Ausstellung",
    "Konzert",
    "Talk/Lesung",
    "Comedy",
    "Tanz/Performance",
  ],
  moods: ["Leicht", "Experimentell", "Klassisch", "Politisch", "Familie"],
  districts: [
    "Mitte",
    "X-Berg",
    "P-Berg",
    "Charlottenburg",
    "Wedding",
    "F-Hain",
    "Schöneberg",
  ],
  timing: ["After Work", "Weekend", "Day"],
  preferredDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  preferredLanguages: ["DE", "EN", "Non-V"],
} as const;

export type OnboardingPreferenceGroup =
  keyof typeof onboardingPreferenceOptions;
export type OnboardingPreferenceSelections = {
  [Key in OnboardingPreferenceGroup]: Array<
    (typeof onboardingPreferenceOptions)[Key][number]
  >;
};

export const defaultOnboardingPreferences: OnboardingPreferenceSelections = {
  interests: [],
  moods: [],
  districts: [],
  timing: [],
  preferredDays: [],
  preferredLanguages: ["DE", "EN"],
};

export type AdminAssetUploadKind = "event" | "partner";
export type AdminAssetUploadResponse =
  | {
      ok: true;
      data: {
        kind: AdminAssetUploadKind;
        key: string;
        url: string;
        contentType: string;
        filename: string;
      };
    }
  | {
      ok: false;
      formError?: string;
      fieldErrors?: Record<string, string>;
    };

export interface VisualSystemContextProps {
  view: View;
  setView: React.Dispatch<React.SetStateAction<View>>;
  discoveryFilters: DiscoveryFilters;
  setDiscoveryFilters: React.Dispatch<React.SetStateAction<DiscoveryFilters>>;
  selectedEvent: EventCardView | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<EventCardView | null>>;
  bookingEvent: EventCardView | null;
  setBookingEvent: React.Dispatch<React.SetStateAction<EventCardView | null>>;
  selectedLanguage: UiLanguage;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<UiLanguage>>;
  membersPage: number;
  setMembersPage: React.Dispatch<React.SetStateAction<number>>;
  membersPageSize: number;
  setMembersPageSize: React.Dispatch<React.SetStateAction<number>>;
  partnersPage: number;
  setPartnersPage: React.Dispatch<React.SetStateAction<number>>;
  partnersPageSize: number;
  setPartnersPageSize: React.Dispatch<React.SetStateAction<number>>;
  eventsPage: number;
  setEventsPage: React.Dispatch<React.SetStateAction<number>>;
  eventsPageSize: number;
  setEventsPageSize: React.Dispatch<React.SetStateAction<number>>;
  live: LiveDataView;
  shell: AppShellViewModel;
  // biome-ignore lint/suspicious/noExplicitAny: Page shell view model can be of any layout type
  pageShell: any;
  navigateShell: (actionId: string) => Promise<void>;
  handleOpenEvent: (event: EventCardView | null) => void;
  callbackURL: string;
  initialTab?: string;
}

export const VisualSystemContext =
  createContext<VisualSystemContextProps | null>(null);

export function useVisualSystem() {
  const ctx = useContext(VisualSystemContext);
  if (!ctx)
    throw new Error("useVisualSystem must be used within VisualSystemProvider");
  return ctx;
}

// Utility Helpers
export async function runServerAction<TData>(
  action: () => Promise<{
    data?:
      | { ok: true; notice?: { message: string }; data?: TData }
      | { ok: false; formError?: string; fieldErrors?: Record<string, string> };
    error?: unknown;
  }>,
  setMessage: (message: string) => void,
  onSuccess?: (data: TData | undefined) => void,
  onFailure?: (
    fieldErrors?: Record<string, string>,
    formError?: string,
  ) => void,
) {
  const result = await action();
  if (result.error || !result.data) {
    setMessage("The request could not be completed.");
    onFailure?.();
    return;
  }
  if (!result.data.ok) {
    setMessage(result.data.formError ?? "Check the highlighted fields.");
    onFailure?.(result.data.fieldErrors, result.data.formError);
    return;
  }
  setMessage(result.data.notice?.message ?? "Saved.");
  onSuccess?.(result.data.data);
}

export function csvEscape(value: unknown) {
  const text =
    value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(
  filename: string,
  rows: Array<Record<string, unknown>>,
  headers: string[],
) {
  if (rows.length === 0) return false;
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

// Skeletons
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ui-bf84c38c", className)} {...props} />;
}

export function MemberCardSkeleton() {
  return (
    <div className="unveiled-shadow ui-9e1eebd6">
      <div className="ui-204f9214">
        <div className="ui-74f315ba">
          <Skeleton className="ui-e27742fb" />
          <Skeleton className="ui-6ed0b0b0" />
          <Skeleton className="ui-7b2b6151" />
          <Skeleton className="ui-b8363213" />
        </div>
        <div className="ui-c354e22d">
          <Skeleton className="ui-5e23f1fe" />
          <Skeleton className="ui-f35e76a8" />
        </div>
      </div>
    </div>
  );
}

export function EventRowSkeleton() {
  return (
    <div className="grid-cols-1 last:border-b-0 ui-180f30e4">
      <div className="ui-26717177">
        <Skeleton className="ui-116c2eff" />
        <Skeleton className="ui-69bb51d9" />
      </div>
      <Skeleton className="ui-04b8b55c" />
      <Skeleton className="ui-ff497752" />
      <Skeleton className="ui-7ea70445" />
      <Skeleton className="ui-b8a834ed" />
      <Skeleton className="ui-5e23f1fe" />
    </div>
  );
}

export function PartnerRowSkeleton() {
  return (
    <div className="grid-cols-1 last:border-b-0 ui-4172b819">
      <div className="ui-26717177">
        <Skeleton className="ui-e27742fb" />
        <Skeleton className="ui-0ce3fa0b" />
      </div>
      <div className="app-page-toolbar">
        <Skeleton className="ui-f35e76a8" />
        <Skeleton className="ui-5e23f1fe" />
        <Skeleton className="ui-5e23f1fe" />
      </div>
    </div>
  );
}

export function GuestRowSkeleton() {
  return (
    <div className="grid-cols-1 last:border-b-0 ui-1a112f10">
      <div className="ui-26717177">
        <Skeleton className="ui-6e0a0185" />
        <Skeleton className="ui-8b1b94c4" />
      </div>
      <Skeleton className="ui-116c2eff" />
      <Skeleton className="ui-b8a834ed" />
      <Skeleton className="ui-148826ce" />
    </div>
  );
}

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  hasMore,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className={cn("ui-dc94094b", className)}>
      <div className="ui-00ebb85d">
        <span className="unveiled-meta">Show</span>
        <SelectInput
          value={String(pageSize)}
          onChange={(e) => {
            const nextSize = Number(e.currentTarget.value);
            onPageSizeChange(nextSize);
            onPageChange(1);
          }}
          className="ui-def34157"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </SelectInput>
        <span className="unveiled-meta">per page</span>
      </div>

      <div className="ui-1dabc0cd">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="hover:bg-brand-yellow disabled:opacity-50 disabled:hover:bg-white ui-c79941c7"
        >
          <ArrowLeft className="ui-df001b2d" />
          <span>Prev</span>
        </Button>

        <span className="unveiled-meta ui-7cd26142">
          Page {page} of {totalPages}{" "}
          <span className="ui-0b5a4d12">({totalCount} total)</span>
        </span>

        <Button
          type="button"
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className="hover:bg-brand-yellow disabled:opacity-50 disabled:hover:bg-white ui-c79941c7"
        >
          <span>Next</span>
          <ArrowRight className="ui-df001b2d" />
        </Button>
      </div>
    </div>
  );
}

export function AdminAssetUploadField({
  kind,
  label,
  ownerId,
  value,
  onUrlChange,
  testId,
  className,
}: {
  kind: AdminAssetUploadKind;
  label: string;
  ownerId: string;
  value: string;
  onUrlChange: (url: string) => void;
  testId: string;
  className?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("Ready");
  const [uploading, setUploading] = useState(false);
  const [uploadUnavailable, setUploadUnavailable] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function uploadFile(file: File) {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return objectUrl;
    });
    setMessage("Uploading");
    setUploading(true);

    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("ownerId", ownerId);
    formData.set("file", file);

    try {
      const response = await fetch("/api/admin/assets/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as AdminAssetUploadResponse;

      if (!payload.ok) {
        setPreviewUrl((current) => {
          if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
          return null;
        });
        setUploadUnavailable(response.status === 503);
        setMessage(
          payload.formError ??
            payload.fieldErrors?.file ??
            "The upload could not be completed.",
        );
        return;
      }

      onUrlChange(payload.data.url);
      setUploadUnavailable(false);
      setPreviewUrl(payload.data.url);
      setMessage(`Uploaded ${payload.data.filename}`);
    } catch {
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
      setMessage("The upload could not be completed.");
    } finally {
      setUploading(false);
    }
  }

  const visiblePreview = previewUrl ?? value;

  return (
    <Card tone="cream" shadow={false} className={cn("ui-d1ec5c8a", className)}>
      <div className="ui-204f9214">
        <div>
          <p className="unveiled-meta">{label}</p>
          <p className="ui-f48ac2d0">
            {uploadUnavailable
              ? "Upload unavailable; HTTPS URL fallback active."
              : message}
          </p>
        </div>
        <label className="hover:bg-white hover:shadow-[4px_4px_0_0_#202621] ui-aa88c444">
          <UploadIcon />
          {uploading ? "Uploading" : "Upload"}
          <input
            data-testid={testId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="ui-32fb0905"
            disabled={uploading}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void uploadFile(file);
            }}
          />
        </label>
      </div>
      <div className="ui-0230938f">
        <div className="ui-d6434a2d">
          {visiblePreview ? (
            <SafeImagePlain
              src={visiblePreview}
              alt=""
              className="ui-344fb22d"
              fallbackSrc={
                kind === "event"
                  ? "/placeholders/event.svg"
                  : "/placeholders/partner.svg"
              }
            />
          ) : (
            <span className="ui-51a57728">Preview</span>
          )}
        </div>
        <Field label="Asset URL">
          <TextInput
            name={kind === "event" ? "imageUrl" : "logoUrl"}
            type="url"
            pattern="https://.*"
            title="Use a HTTPS asset URL."
            value={value}
            placeholder="https://assets.example.com/image.jpg"
            onChange={(event) => onUrlChange(event.currentTarget.value)}
          />
        </Field>
      </div>
    </Card>
  );
}

function useLiveDataView(
  initialSurface: InitialSurfaceData | undefined,
  discoveryFilters: DiscoveryFilters,
  setDiscoveryFilters: (filters: DiscoveryFilters) => void,
  adminFilters?: DiscoveryFilters & {
    membersPage?: string;
    membersPageSize?: string;
    partnersPage?: string;
    partnersPageSize?: string;
    eventsPage?: string;
    eventsPageSize?: string;
  },
) {
  const publicInitial =
    initialSurface?.surface === "public" ? initialSurface : undefined;
  const memberInitial =
    initialSurface?.surface === "member" ? initialSurface : undefined;
  const partnerInitial =
    initialSurface?.surface === "partner" ? initialSurface : undefined;
  const adminInitial =
    initialSurface?.surface === "admin" ? initialSurface : undefined;

  const publicQuery = usePublicDiscoveryQuery(discoveryFilters, {
    initialData: publicInitial?.data,
    enabled: Boolean(publicInitial),
  });
  const memberQuery = useMemberDataQuery(
    memberInitial?.userId ?? "",
    discoveryFilters,
    {
      initialData: memberInitial?.data,
      enabled: Boolean(memberInitial),
    },
  );
  const partnerQuery = usePartnerDataQuery(partnerInitial?.partnerId ?? "", {
    initialData: partnerInitial?.data,
    enabled: Boolean(partnerInitial),
  });
  const adminQuery = useAdminDataQuery(adminFilters, {
    initialData: adminInitial?.data,
    enabled: Boolean(adminInitial),
  });

  const publicData =
    memberQuery.data?.discovery ?? publicQuery.data ?? emptyPublicData;
  const isLoading =
    publicQuery.isLoading ||
    memberQuery.isLoading ||
    partnerQuery.isLoading ||
    adminQuery.isLoading;
  const isError =
    publicQuery.isError ||
    memberQuery.isError ||
    partnerQuery.isError ||
    adminQuery.isError;

  return createLiveDataView({
    publicData,
    memberData: memberQuery.data,
    partnerData: partnerQuery.data,
    adminData: adminQuery.data,
    isLoading,
    isError,
    refetchActiveSurface: () => {
      if (initialSurface?.surface === "member") void memberQuery.refetch();
      else if (initialSurface?.surface === "partner")
        void partnerQuery.refetch();
      else if (initialSurface?.surface === "admin") void adminQuery.refetch();
      else void publicQuery.refetch();
    },
    setDiscoveryFilters,
    discoveryFilters,
  });
}

function localizeShellViewModel(
  shell: AppShellViewModel,
  language: UiLanguage,
  counts: { savedCount: number; creditCount: number },
): AppShellViewModel {
  const copy = copyFor(language);
  const navCopy = copy.shell.nav;

  const labelForItem = (
    itemId: AppShellViewModel["navItems"][number]["itemId"],
  ) => {
    if (itemId === "discover") return navCopy.discover;
    if (itemId === "how") return navCopy.how;
    if (itemId === "membership") return navCopy.membership;
    if (itemId === "faq") return navCopy.faq;
    if (itemId === "member") return navCopy.member;
    if (itemId === "saved") return navCopy.saved;
    if (itemId === "bookings") return navCopy.bookings;
    if (itemId === "profile") return navCopy.profile;
    return itemId === "admin"
      ? "Admin"
      : itemId === "partner"
        ? "Partner"
        : shell.logo.alt;
  };

  return {
    ...shell,
    language: {
      ...shell.language,
      selected: language,
    },
    tagline:
      shell.viewerContext === "guest" ? copy.shell.tagline : shell.tagline,
    savedCount: counts.savedCount,
    creditCount:
      shell.viewerContext === "member" ? counts.creditCount : shell.creditCount,
    navItems: shell.navItems.map((item) => ({
      ...item,
      label: labelForItem(item.itemId),
      count: item.itemId === "saved" ? counts.savedCount : item.count,
    })),
    primaryAction: shell.primaryAction
      ? {
          ...shell.primaryAction,
          label:
            shell.primaryAction.id === "login"
              ? navCopy.login
              : navCopy.becomeMember,
        }
      : undefined,
  };
}

export function VisualSystemProvider({
  initialShell,
  initialDiscovery,
  initialView = "landing",
  callbackURL = "/",
  initialTab = "metrics",
  children,
}: {
  initialShell?: AppShellViewModel;
  initialDiscovery?: InitialSurfaceData;
  initialView?: View;
  callbackURL?: string;
  initialTab?: string;
  children: React.ReactNode;
}) {
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>(
    initialDiscovery && "filters" in initialDiscovery
      ? (initialDiscovery.filters ?? {})
      : {},
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialDiscovery && "filters" in initialDiscovery) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl: DiscoveryFilters = {};
    const category = params.get("category");
    const partnerId = params.get("partnerId");
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    const page = params.get("page");
    if (category) fromUrl.category = category;
    if (partnerId) fromUrl.partnerId = partnerId;
    if (startDate) fromUrl.startDate = startDate;
    if (endDate) fromUrl.endDate = endDate;
    if (page) fromUrl.page = page;
    if (Object.keys(fromUrl).length > 0) {
      setDiscoveryFilters((prev) => ({ ...prev, ...fromUrl }));
    }
  }, [initialDiscovery]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const apply = (
      key: "category" | "partnerId" | "startDate" | "endDate" | "page",
      value: string | undefined,
    ) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };
    apply("category", discoveryFilters.category);
    apply("partnerId", discoveryFilters.partnerId);
    apply("startDate", discoveryFilters.startDate);
    apply("endDate", discoveryFilters.endDate);
    apply("page", discoveryFilters.page);
    const next = `${url.pathname}?${params.toString()}${url.hash}`;
    const current = `${url.pathname}${url.search}${url.hash}`;
    if (next !== current) {
      window.history.replaceState(null, "", next);
    }
  }, [discoveryFilters]);

  const setDiscoveryFiltersWrapped = (
    value: React.SetStateAction<DiscoveryFilters>,
  ) => {
    setDiscoveryFilters((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const hasFilterChanged =
        next.category !== prev.category ||
        next.partnerId !== prev.partnerId ||
        next.startDate !== prev.startDate ||
        next.endDate !== prev.endDate;
      if (hasFilterChanged) {
        return { ...next, page: undefined };
      }
      return next;
    });
  };
  const [selectedEvent, setSelectedEvent] = useState<EventCardView | null>(
    null,
  );
  const [bookingEvent, setBookingEvent] = useState<EventCardView | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<UiLanguage>(
    initialShell?.language.selected ?? "DE",
  );
  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize, setMembersPageSize] = useState(20);
  const [partnersPage, setPartnersPage] = useState(1);
  const [partnersPageSize, setPartnersPageSize] = useState(20);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsPageSize, setEventsPageSize] = useState(20);
  const [view, setView] = useState<View>(initialView);

  const adminFilters = useMemo(
    () => ({
      membersPage: String(membersPage),
      membersPageSize: String(membersPageSize),
      partnersPage: String(partnersPage),
      partnersPageSize: String(partnersPageSize),
      eventsPage: String(eventsPage),
      eventsPageSize: String(eventsPageSize),
    }),
    [
      membersPage,
      membersPageSize,
      partnersPage,
      partnersPageSize,
      eventsPage,
      eventsPageSize,
    ],
  );

  const live = useLiveDataView(
    initialDiscovery,
    discoveryFilters,
    setDiscoveryFiltersWrapped,
    adminFilters,
  );

  const handleOpenEvent = (event: EventCardView | null) => {
    setSelectedEvent(event);
    setBookingEvent(event);
    if (event) {
      void actions.trackEventOpen({
        eventId: event.id,
        viewName: view,
      });
    }
  };

  const prevFiltersRef = useRef<DiscoveryFilters>(discoveryFilters);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const hasChanged =
      discoveryFilters.category !== prevFiltersRef.current.category ||
      discoveryFilters.partnerId !== prevFiltersRef.current.partnerId ||
      discoveryFilters.startDate !== prevFiltersRef.current.startDate ||
      discoveryFilters.endDate !== prevFiltersRef.current.endDate ||
      discoveryFilters.savedOnly !== prevFiltersRef.current.savedOnly;

    if (!hasChanged) {
      return;
    }

    prevFiltersRef.current = discoveryFilters;

    const timer = setTimeout(() => {
      void actions.trackFilterApply({
        viewName: view,
        filters: {
          category: discoveryFilters.category,
          partnerId: discoveryFilters.partnerId,
          startDate: discoveryFilters.startDate,
          endDate: discoveryFilters.endDate,
          resultCount: live.events.length,
        },
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [discoveryFilters, view, live.events.length]);

  const demoShell = createDemoShellViewModel(view, {
    savedCount: live.savedCount,
    creditCount: live.profile.credits,
  });

  const shell = localizeShellViewModel(
    initialShell ?? demoShell,
    selectedLanguage,
    {
      savedCount: live.savedCount,
      creditCount: live.profile.credits,
    },
  );

  const memberPageShell =
    initialShell &&
    view === "member" &&
    ["Admin Frozen", "Unpaid"].includes(
      live.billingDisplay.subscriptionStatusLabel,
    )
      ? demoPageShells.member
      : undefined;

  const pageShell = view === "member" ? memberPageShell : undefined;

  const navigateShell = async (actionId: string) => {
    if (actionId === "new-event") {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "add-event");
        window.history.pushState(null, "", url.pathname + url.search);
        window.dispatchEvent(new Event("admin-tab-change"));
      }
      return;
    }

    if (actionId.startsWith("language:")) {
      const language = actionId.slice("language:".length);
      if (language === "DE" || language === "EN") {
        setSelectedLanguage(language);
        if (typeof document !== "undefined") {
          // biome-ignore lint/suspicious/noDocumentCookie: client-side cookie write for instant locale preference
          document.cookie = `unveiled_lang=${language}; path=/; max-age=31536000; SameSite=Lax`;
        }
        actions.setLanguage({ language }).catch((e: unknown) => {
          console.error("Failed to set user language profile:", e);
        });
        if (typeof window !== "undefined") {
          const nextLang = language.toLowerCase();
          const currentPath = window.location.pathname;
          const currentSearch = window.location.search;
          const internalPath = stripAppBase(currentPath);
          const nextInternalPath = /^(\/(?:de|en))(?=\/|$)/i.test(internalPath)
            ? internalPath.replace(/^(\/(?:de|en))/i, `/${nextLang}`)
            : `/${nextLang}${internalPath === "/" ? "/" : internalPath}`;
          const nextPath = `${APP_BASE_PREFIX}${nextInternalPath === "/" ? "/" : nextInternalPath}`;
          window.location.assign(nextPath + currentSearch);
        }
      }
      return;
    }
    const target = shellDemoViews.find((item) => item.id === actionId);
    if (target) setView(target.id as View);
    if (actionId === "membership")
      window.location.assign(
        `/app/${selectedLanguage.toLowerCase()}/membership`,
      );
    if (actionId === "logo")
      setView(view === "partner" || view === "admin" ? view : "landing");
    if (actionId === "profile") setView("profile");
    if (actionId === "logout") {
      await fetch("/api/account/logout", { method: "POST" });
      window.location.assign(`/app/${selectedLanguage.toLowerCase()}/`);
    }
  };

  const contextValue: VisualSystemContextProps = {
    view,
    setView,
    discoveryFilters,
    setDiscoveryFilters: setDiscoveryFiltersWrapped,
    selectedEvent,
    setSelectedEvent,
    bookingEvent,
    setBookingEvent,
    selectedLanguage,
    setSelectedLanguage,
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
    live,
    shell,
    pageShell,
    navigateShell,
    handleOpenEvent,
    callbackURL,
    initialTab,
  };

  return (
    <VisualSystemContext.Provider value={contextValue}>
      <LiveDataContext.Provider value={live}>
        <LanguageContext.Provider value={selectedLanguage}>
          {children}
        </LanguageContext.Provider>
      </LiveDataContext.Provider>
    </VisualSystemContext.Provider>
  );
}

type SafeImagePlainProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  fallbackSrc: string;
};

function SafeImagePlain({
  src,
  fallbackSrc,
  alt,
  ...props
}: SafeImagePlainProps) {
  const [errored, setErrored] = React.useState(false);
  const resolved = !src || errored ? fallbackSrc : src;
  return (
    // biome-ignore lint/performance/noImgElement: bespoke fallback handler; design system removed SafeImage in iteration-13 proposal 07.
    <img src={resolved} alt={alt} onError={() => setErrored(true)} {...props} />
  );
}
