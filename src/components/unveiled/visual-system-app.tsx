import { actions } from "astro:actions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Plus,
  QrCode,
  Upload as UploadIcon,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Resolver, useForm } from "react-hook-form";

import { QueryProvider } from "@/components/providers/query-provider";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Card,
  Divider,
  Field,
  Panel,
  SelectInput,
  StatePanel,
  StatPanel,
  TableRow,
  TableShell,
  TextArea,
  TextInput,
} from "@/components/ui/unveiled-primitives";
import {
  AppShell,
  DiscoveryShell,
  ModalShell,
  PageShell,
} from "@/components/unveiled/app-shell";
import { DiscoveryMapPanel } from "@/components/unveiled/discovery-map";
import {
  type AppShellViewModel,
  createDemoShellViewModel,
  demoDiscoveryShell,
  demoModalShell,
  demoPageShells,
  type ShellNavItemId,
  shellDemoViews,
} from "@/lib/app-shell-view-models";
import {
  downloadCalendarFile,
  isBookingCalendarActionAvailable,
} from "@/lib/calendar";
import {
  useAdminDataQuery,
  useMemberDataQuery,
  usePartnerDataQuery,
  usePublicDiscoveryQuery,
} from "@/lib/data-access/hooks";
import {
  createLiveDataView,
  emptyLiveDataView,
  emptyPublicData,
  type LiveDataView,
} from "@/lib/data-access/live-view-adapters";
import type { DiscoveryFilters } from "@/lib/data-access/query-keys";
import {
  type InitialSurfaceData,
  isInitialSurfaceData,
} from "@/lib/data-access/surface-data";
import { readDiscoveryMapProviderConfig } from "@/lib/discovery-map";
import { actionSuccess, formFailure } from "@/lib/forms/action-result";
import { applyFormActionResult } from "@/lib/forms/client-action";
import {
  loginSchema,
  passwordRecoverySchema,
  signupSchema,
} from "@/lib/forms/schemas";
import { copyFor, type UiLanguage } from "@/lib/i18n";
import {
  derivedValues,
  type EventCardView,
  formContracts,
} from "@/lib/unveiled-view-models";
import { cn } from "@/lib/utils";

type View = Extract<
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

type AuthLandingValues = {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  callbackURL?: string;
};

type AuthEndpointResult = {
  ok: boolean;
  state?: {
    message?: string;
  };
  nextPath?: string;
};

const onboardingPreferenceOptions = {
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

type OnboardingPreferenceGroup = keyof typeof onboardingPreferenceOptions;
type OnboardingPreferenceSelections = {
  [Key in OnboardingPreferenceGroup]: Array<
    (typeof onboardingPreferenceOptions)[Key][number]
  >;
};

type AdminAssetUploadKind = "event" | "partner";
type AdminAssetUploadResponse =
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

const defaultOnboardingPreferences: OnboardingPreferenceSelections = {
  interests: [],
  moods: [],
  districts: [],
  timing: [],
  preferredDays: [],
  preferredLanguages: ["DE", "EN"],
};

const LiveDataContext = createContext<LiveDataView>(emptyLiveDataView);
const LanguageContext = createContext<UiLanguage>("DE");

function useLiveData() {
  return useContext(LiveDataContext);
}

function useCopy() {
  return copyFor(useContext(LanguageContext));
}

async function runServerAction<TData>(
  action: () => Promise<{
    data?:
      | { ok: true; notice?: { message: string }; data?: TData }
      | { ok: false; formError?: string };
    error?: unknown;
  }>,
  setMessage: (message: string) => void,
  onSuccess?: (data: TData | undefined) => void,
) {
  const result = await action();
  if (result.error || !result.data) {
    setMessage("The request could not be completed.");
    return;
  }
  if (!result.data.ok) {
    setMessage(result.data.formError ?? "Check the highlighted fields.");
    return;
  }
  setMessage(result.data.notice?.message ?? "Saved.");
  onSuccess?.(result.data.data);
}

function csvEscape(value: unknown) {
  const text =
    value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(
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

function scrollToAdminEventForm() {
  const form = document.getElementById("admin-event-form");
  form?.scrollIntoView({ behavior: "smooth", block: "start" });
  form
    ?.querySelector<HTMLInputElement>('input[name="title"]')
    ?.focus({ preventScroll: true });
}

function scrollToAdminExport() {
  document
    .getElementById("admin-export-panel")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function AdminAssetUploadField({
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
    <Panel
      tone="cream"
      shadow={false}
      className={cn("space-y-4 p-4", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="unveiled-meta">{label}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest opacity-60">
            {uploadUnavailable
              ? "Upload unavailable; HTTPS URL fallback active."
              : message}
          </p>
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-brand-yellow px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark transition-all hover:bg-white hover:shadow-[4px_4px_0_0_#202621]">
          <UploadIcon />
          {uploading ? "Uploading" : "Upload"}
          <input
            data-testid={testId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void uploadFile(file);
            }}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-end">
        <div className="grid aspect-video place-items-center overflow-hidden border-4 border-brand-dark bg-brand-grey">
          {visiblePreview ? (
            <img
              src={visiblePreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest opacity-55">
              Preview
            </span>
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
    </Panel>
  );
}

function LandingPage({
  setView,
  callbackURL = "/",
}: {
  setView: (view: View) => void;
  callbackURL?: string;
}) {
  const copy = useCopy().public;
  const [mode, setMode] = useState<"login" | "signup" | "recovery">("login");
  const [formMessage, setFormMessage] = useState<string>(
    copy.auth.defaultMessage,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeSchema =
    mode === "login"
      ? loginSchema
      : mode === "signup"
        ? signupSchema
        : passwordRecoverySchema;

  const form = useForm<AuthLandingValues>({
    resolver: zodResolver(activeSchema) as Resolver<AuthLandingValues>,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      callbackURL:
        callbackURL ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("callbackURL") ||
            "/"
          : "/"),
    },
  });

  async function submitAuth(values: AuthLandingValues) {
    setIsSubmitting(true);
    setFormMessage("");

    const endpoint =
      mode === "login"
        ? "/api/account/login"
        : mode === "signup"
          ? "/api/account/signup"
          : "/api/account/password-recovery";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const payload = (await response
      .json()
      .catch(() => null)) as AuthEndpointResult | null;

    const actionResult =
      response.ok && payload?.ok
        ? actionSuccess({
            data: { nextPath: payload.nextPath },
            notice: {
              type: "success",
              message: payload.state?.message ?? copy.auth.done,
            },
          })
        : formFailure(payload?.state?.message ?? copy.auth.failed);

    await applyFormActionResult(actionResult, {
      form,
      onFormError: setFormMessage,
      onNotice: setFormMessage,
    });

    setIsSubmitting(false);

    if (actionResult.ok) {
      if (mode === "recovery") {
        setIsSuccess(true);
      } else if (actionResult.data?.nextPath) {
        window.location.assign(actionResult.data.nextPath);
      }
    }
  }

  return (
    <div className="grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
      <section className="space-y-8">
        <div className="space-y-5">
          <Badge tone="white">{copy.landingBadge}</Badge>
          <h1 className="headline-xl max-w-4xl">{copy.landingTitle}</h1>
          <p className="max-w-2xl text-lg font-bold leading-relaxed md:text-2xl">
            {copy.landingBody}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={() => setView("discover")}>
            {copy.exploreAccess}
            <ArrowRight />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setView("how")}
          >
            {copy.howItWorks}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {copy.landingPerks.map((label) => (
            <Badge key={label} tone="yellow" className="justify-center py-2">
              <Check className="size-3" />
              {label}
            </Badge>
          ))}
        </div>
      </section>

      <Panel tone="white" className="space-y-6">
        <div className="flex border-4 border-brand-dark bg-brand-grey p-1">
          <button
            className={cn(
              "flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest",
              mode === "login" && "bg-brand-dark text-white",
            )}
            onClick={() => {
              setMode("login");
              setIsSuccess(false);
            }}
            type="button"
          >
            {copy.auth.login}
          </button>
          <button
            className={cn(
              "flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest",
              mode === "signup" && "bg-brand-dark text-white",
            )}
            onClick={() => {
              setMode("signup");
              setIsSuccess(false);
            }}
            type="button"
          >
            {copy.auth.register}
          </button>
        </div>
        <div>
          <p className="headline-md">
            {mode === "login"
              ? "Welcome back"
              : mode === "signup"
                ? copy.auth.createAccess
                : copy.auth.resetPassword}
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-55">
            {mode === "recovery"
              ? copy.auth.recoveryInstructions
              : copy.auth.helper}
          </p>
        </div>
        <Panel tone="cream" shadow={false} className="p-4">
          <p className="unveiled-meta">{copy.auth.notice}</p>
          <p className="text-sm font-bold">
            {formMessage || copy.auth.defaultMessage}
          </p>
        </Panel>
        {isSuccess ? (
          <StatePanel
            state="success"
            title={copy.auth.checkEmail}
            text={copy.auth.recoverySent}
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setMode("login");
                  setIsSuccess(false);
                }}
              >
                {copy.auth.backToLogin}
              </Button>
            }
          />
        ) : (
          <form className="grid gap-4" onSubmit={form.handleSubmit(submitAuth)}>
            {mode === "signup" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={copy.auth.firstName}
                  error={form.formState.errors.firstName?.message}
                >
                  <TextInput
                    placeholder="Alex"
                    {...form.register("firstName")}
                  />
                </Field>
                <Field
                  label={copy.auth.lastName}
                  error={form.formState.errors.lastName?.message}
                >
                  <TextInput
                    placeholder="Morgan"
                    {...form.register("lastName")}
                  />
                </Field>
              </div>
            ) : null}
            <Field
              label={copy.auth.email}
              error={form.formState.errors.email?.message}
            >
              <TextInput
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
              />
            </Field>
            {mode !== "recovery" ? (
              <Field
                label={copy.auth.password}
                error={form.formState.errors.password?.message}
                helper={formContracts.landing.visibleMessages[1]}
              >
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
              </Field>
            ) : null}
            <Button type="submit" className="w-full" loading={isSubmitting}>
              {mode === "login"
                ? "Login"
                : mode === "signup"
                  ? copy.auth.startMembership
                  : copy.auth.sendReset}
            </Button>
            {mode === "login" ? (
              <button
                type="button"
                className="text-left text-[10px] font-black uppercase tracking-widest underline opacity-50 hover:opacity-100"
                onClick={() => setMode("recovery")}
              >
                {copy.auth.forgotPassword}
              </button>
            ) : mode === "recovery" ? (
              <button
                type="button"
                className="text-left text-[10px] font-black uppercase tracking-widest underline opacity-50 hover:opacity-100"
                onClick={() => setMode("login")}
              >
                {copy.auth.backToLogin}
              </button>
            ) : null}
          </form>
        )}
      </Panel>
    </div>
  );
}

function EventCard({
  event,
  compact = false,
  onOpen,
  onSave,
}: {
  event: EventCardView;
  compact?: boolean;
  onOpen: (event: EventCardView) => void;
  onSave?: (event: EventCardView) => void;
}) {
  const copy = useCopy().event;
  return (
    <Card
      interactive
      className="group flex h-full flex-col overflow-hidden"
      data-testid={`event-card-${event.id}`}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b-4 border-brand-dark",
          compact ? "h-48" : "h-64",
        )}
      >
        <img
          src={event.imageUrl || undefined}
          alt={event.title}
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
        />
        <Badge tone="dark" className="absolute left-3 top-3">
          {event.category}
        </Badge>
        <div className="absolute inset-x-0 bottom-0 flex translate-y-0 items-center justify-between border-t-4 border-brand-dark bg-brand-yellow p-3 transition-transform md:translate-y-full md:group-hover:translate-y-0">
          <span className="unveiled-meta">{event.capacityLabel}</span>
          <span className="hidden text-[10px] font-black uppercase tracking-widest sm:block">
            {event.ticketType}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5 md:p-7">
        <div>
          <h3 className="font-display text-3xl font-black uppercase leading-none">
            {event.title}
          </h3>
          <p className="mt-2 unveiled-meta opacity-40">{event.partnerName}</p>
        </div>
        <div className="grid flex-1 gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-2">
            <Calendar className="size-4" />
            {event.dateLabel}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" />
            {event.neighborhood}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t-2 border-brand-grey pt-4">
          <div className="font-display text-3xl font-black uppercase leading-none">
            {event.creditPrice}
            <span className="ml-1 font-sans text-[10px] tracking-widest opacity-35">
              {copy.credits}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={event.saved ? "active" : "outline"}
              size="icon-sm"
              aria-label={event.saved ? copy.saved : copy.save}
              onClick={() => onSave?.(event)}
            >
              <Bookmark fill={event.saved ? "currentColor" : "none"} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={event.remainingCapacity === 0 ? "muted" : "primary"}
              onClick={() => onOpen(event)}
            >
              {event.ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PublicDiscover() {
  const copy = useCopy();
  const live = useLiveData();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedPublicEvent, setSelectedPublicEvent] =
    useState<EventCardView | null>(null);
  const mapProvider = readDiscoveryMapProviderConfig(
    import.meta.env as { PUBLIC_GOOGLE_MAPS_API_KEY?: string },
  );
  const visible = live.events;
  const discovery = {
    ...demoDiscoveryShell,
    filtersOpen,
    mapOpen,
    visibleResultCount: visible.length,
    resultCountLabel: live.visibleEventCountLabel,
    activeRangeLabel: live.activeRangeLabel,
    activeFilterCount: live.activeFilterCount,
    filterToggleLabel: copy.discovery.refine,
    mapToggleLabel: copy.discovery.map,
    emptyState: {
      state: live.isLoading ? "loading" : live.isError ? "error" : "empty",
      title: copy.discovery.noPublicTitle,
      message: live.isLoading
        ? copy.discovery.liveLoading
        : live.isError
          ? copy.discovery.liveError
          : copy.discovery.noUpcoming,
      retryAction: {
        id: "reset-filters",
        label: copy.discovery.resetFilters,
      },
    },
  } as const;

  return (
    <>
      <DiscoveryShell
        discovery={discovery}
        filterPanel={<DiscoveryFilterPanel />}
        mapPanel={
          <DiscoveryMapPanel
            events={visible}
            surface="public"
            providerKey={mapProvider.key}
            actionLabel={copy.discovery.viewEvent}
            onOpenEvent={(event) => {
              setSelectedPublicEvent(event);
            }}
            onRetry={live.refetchActiveSurface}
          />
        }
        onAction={(actionId) => {
          if (actionId === "toggle-filters") {
            setFiltersOpen((open) => !open);
            setMapOpen(false);
          }
          if (actionId === "toggle-map") {
            setMapOpen((open) => !open);
            setFiltersOpen(false);
          }
          if (actionId === "reset-filters") {
            live.setDiscoveryFilters?.({});
            live.refetchActiveSurface();
          }
        }}
      >
        <div className="space-y-10 py-8">
          <Panel
            tone="white"
            className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end"
          >
            <div>
              <Badge tone="yellow">{copy.public.discover.included}</Badge>
              <h1 className="headline-lg mt-5">{copy.public.discover.title}</h1>
              <p className="mt-4 max-w-2xl text-lg font-bold leading-relaxed">
                {copy.public.discover.body}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {live.publicStats.map((stat) => (
                <StatPanel key={stat.label} {...stat} />
              ))}
            </div>
          </Panel>

          <section className="grid gap-5 md:grid-cols-3">
            {live.publicCategories.map((category) => (
              <Card key={category} interactive className="bg-brand-cream p-6">
                <p className="headline-md">{category}</p>
                <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-60">
                  {copy.public.discover.categoryBody}
                </p>
              </Card>
            ))}
          </section>

          <section className="grid gap-5 lg:grid-cols-3">
            {live.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                compact
                onOpen={() => setSelectedPublicEvent(event)}
              />
            ))}
          </section>

          <section className="grid gap-5 md:grid-cols-[1fr_1fr]">
            <Panel tone="dark">
              <p className="unveiled-meta opacity-60">
                {copy.public.discover.missingVenue}
              </p>
              <p className="headline-md mt-4">
                {copy.public.discover.wantPartner}
              </p>
              <Button type="button" variant="yellow" className="mt-6">
                {copy.public.discover.tellSupport}
                <Mail />
              </Button>
            </Panel>
            <Panel tone="white">
              <p className="unveiled-meta opacity-60">
                {copy.public.discover.activePartners}
              </p>
              <div className="mt-4 grid gap-3">
                {live.publicPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center gap-3 border-4 border-brand-dark bg-brand-grey p-3"
                  >
                    <span className="grid size-10 place-items-center bg-brand-dark font-display text-lg font-black text-white">
                      {partner.logoInitial}
                    </span>
                    <span>
                      <span className="block text-xs font-black uppercase tracking-widest">
                        {partner.name}
                      </span>
                      <span className="block text-xs font-bold opacity-55">
                        {partner.address}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        </div>
      </DiscoveryShell>
      {selectedPublicEvent ? (
        <BookingModal
          key={selectedPublicEvent.id}
          event={selectedPublicEvent}
          onClose={() => setSelectedPublicEvent(null)}
        />
      ) : null}
    </>
  );
}

function HowItWorks() {
  const copy = useCopy().public.how;
  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">{copy.badge}</Badge>
        <h1 className="headline-lg mt-5 max-w-4xl">{copy.title}</h1>
      </Panel>
      <div className="grid gap-5 md:grid-cols-3">
        {copy.steps.map((title, index) => (
          <Card key={title} className="p-6">
            <p className="font-display text-7xl font-black leading-none">
              0{index + 1}
            </p>
            <h2 className="mt-5 font-display text-3xl font-black uppercase leading-none">
              {title}
            </h2>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-60">
              {copy.stepBody}
            </p>
          </Card>
        ))}
      </div>
      <Panel
        tone="dark"
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"
      >
        <p className="headline-md">{copy.membership}</p>
        <Badge tone="yellow">{copy.monthlyCredits}</Badge>
      </Panel>
    </div>
  );
}

function FaqPage({ setView }: { setView: (view: View) => void }) {
  const copy = useCopy().public.faq;
  return (
    <div className="space-y-8 py-8">
      <Button type="button" variant="ghost" onClick={() => setView("landing")}>
        <ArrowLeft />
        {copy.back}
      </Button>
      <Panel tone="white">
        <Badge tone="yellow">FAQ</Badge>
        <h1 className="headline-lg mt-5">{copy.title}</h1>
      </Panel>
      <div className="grid gap-4">
        {copy.questions.map((question, index) => (
          <details
            key={question}
            className="border-4 border-brand-dark bg-white p-5 open:bg-brand-cream"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black uppercase tracking-widest">
              {question}
              <ChevronDown className="size-5" />
            </summary>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-6 opacity-65">
              {copy.answers[index]}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

const onboardingTranslations = {
  DE: {
    title: "DEIN KULTUR-PROFIL",
    subtitle: "Wir finden die Events, die wirklich zu dir passen.",
    ageLabel: "WIE ALT BIST DU?",
    ageSubtitle:
      "Keine Sorge, nur für die Statistik (und Altersbeschränkungen).",
    interestLabel: "WAS INTERESSIERT DICH?",
    moodLabel: "WELCHE VIBES SUCHST DU?",
    districtLabel: "WO BIST DU UNTERWEGS?",
    radiusLabel: "WIE WEIT WÜRDEST DU FAHREN?",
    timingLabel: "WANN HAST DU ZEIT?",
    daysLabel: "WELCHE TAGE?",
    languagePrefLabel: "SPRACHEN?",
    accessibilityLabel: "BARRIEREFREIHEIT ERFORDERLICH?",
    finish: "FERTIG",
    next: "WEITER",
    back: "ZURÜCK",
    skip: "ÜBERSPRINGEN",
    km: "km",
  },
  EN: {
    title: "YOUR CULTURE PROFILE",
    subtitle: "Let's find the events that actually vibe with you.",
    ageLabel: "HOW OLD ARE YOU?",
    ageSubtitle: "Don't worry, just for stats (and age restrictions).",
    interestLabel: "WHAT INTERESTS YOU?",
    moodLabel: "WHAT VIBES ARE YOU AFTER?",
    districtLabel: "WHERE DO YOU HANG OUT?",
    radiusLabel: "HOW FAR WOULD YOU TRAVEL?",
    timingLabel: "WHEN DO YOU HAVE TIME?",
    daysLabel: "WHICH DAYS?",
    languagePrefLabel: "LANGUAGES?",
    accessibilityLabel: "ACCESSIBILITY REQUIRED?",
    finish: "FINISH",
    next: "NEXT",
    back: "BACK",
    skip: "SKIP",
    km: "km",
  },
};

function OnboardingPage() {
  const copy = useCopy().onboarding;
  const live = useLiveData();
  const language = useContext(LanguageContext);
  const t = onboardingTranslations[language];

  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string>(copy.message);
  const [submitting, setSubmitting] = useState(false);
  const [preferences, setPreferences] =
    useState<OnboardingPreferenceSelections>(defaultOnboardingPreferences);

  const [ageGroup, setAgeGroup] = useState<
    "18-25" | "26-35" | "36-50" | "50+" | ""
  >("");
  const [maxDistance, setMaxDistance] = useState(10);
  const [accessibility, setAccessibility] = useState(false);

  function togglePreference<Group extends OnboardingPreferenceGroup>(
    group: Group,
    value: (typeof onboardingPreferenceOptions)[Group][number],
  ) {
    setPreferences((current) => {
      const selected = current[group];
      const nextValues = selected.includes(value)
        ? selected.filter((entry: string) => entry !== value)
        : [...selected, value];

      return {
        ...current,
        [group]: nextValues,
      };
    });
  }

  async function submit(onboardingComplete: boolean) {
    setSubmitting(true);
    await runServerAction(
      () =>
        actions.saveOnboarding({
          ageGroup: ageGroup || undefined,
          interests: preferences.interests,
          moods: preferences.moods,
          districts: preferences.districts,
          maxDistance,
          timing: preferences.timing,
          preferredDays: preferences.preferredDays,
          preferredLanguages: preferences.preferredLanguages,
          accessibility,
          onboardingComplete,
        }),
      setMessage,
      () => {
        live.refetchActiveSurface();
        window.location.assign("/app");
      },
    );
    setSubmitting(false);
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="unveiled-meta">{t.ageLabel}</h3>
            <div className="grid grid-cols-2 gap-4">
              {(["18-25", "26-35", "36-50", "50+"] as const).map((age) => (
                <button
                  key={age}
                  type="button"
                  className={cn(
                    "border-4 border-brand-dark p-6 font-black text-sm transition-all uppercase tracking-widest",
                    ageGroup === age
                      ? "bg-brand-dark text-white"
                      : "bg-white border-brand-dark text-brand-dark hover:bg-brand-yellow",
                  )}
                  onClick={() => setAgeGroup(age)}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="unveiled-meta mb-3 flex items-center gap-2">
                <Heart className="size-4 fill-brand-dark text-brand-dark" />
                {t.interestLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.interests.map((opt) => {
                  const selected = preferences.interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("interests", opt)}
                    >
                      <Heart
                        className={cn(
                          "size-3",
                          selected ? "fill-brand-dark" : "fill-transparent",
                        )}
                      />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="unveiled-meta mb-3">{t.moodLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.moods.map((opt) => {
                  const selected = preferences.moods.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("moods", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="unveiled-meta mb-3">{t.districtLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.districts.map((opt) => {
                  const selected = preferences.districts.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("districts", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-4 border-brand-dark bg-brand-cream p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="unveiled-meta">{t.radiusLabel}</h3>
                <Badge tone="yellow">
                  {maxDistance} {t.km}
                </Badge>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-brand-grey border-2 border-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-dark"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="unveiled-meta mb-3">{t.timingLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.timing.map((opt) => {
                  const selected = preferences.timing.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("timing", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="unveiled-meta mb-3">{t.daysLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.preferredDays.map((opt) => {
                  const selected = preferences.preferredDays.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "w-10 h-10 border-2 border-brand-dark flex items-center justify-center text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("preferredDays", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t-2 border-brand-dark/20 pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="unveiled-meta mb-3">{t.languagePrefLabel}</h3>
                  <div className="flex gap-2">
                    {onboardingPreferenceOptions.preferredLanguages.map(
                      (opt) => {
                        const selected =
                          preferences.preferredLanguages.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={cn(
                              "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                              selected
                                ? "bg-brand-yellow text-brand-dark"
                                : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                            )}
                            onClick={() =>
                              togglePreference("preferredLanguages", opt)
                            }
                          >
                            {opt}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-brand-cream border-2 border-brand-dark">
                  <span className="unveiled-meta mr-4">
                    {t.accessibilityLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAccessibility(!accessibility)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-all border-2 border-brand-dark relative",
                      accessibility ? "bg-brand-yellow" : "bg-brand-grey",
                    )}
                  >
                    <div
                      className={cn(
                        "w-3 h-3 bg-brand-dark rounded-full transition-all absolute top-1",
                        accessibility ? "right-1.5" : "left-1.5",
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel tone="white" className="space-y-6">
        <Badge tone="yellow">{copy.badge}</Badge>
        <h1 className="headline-lg">{t.title}</h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-55">
          {step === 1 ? t.ageSubtitle : t.subtitle}
        </p>

        {/* Progress Bar */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-55">
              Step: {step}/4
            </span>
            <span className="text-[10px] font-black opacity-40">
              {Math.round((step / 4) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-brand-grey border border-brand-dark overflow-hidden">
            <div
              className="h-full bg-brand-yellow transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {message !== copy.message ? (
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#b21d17]">
            {message}
          </p>
        ) : null}
      </Panel>

      <Panel tone="dark" className="space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <p className="unveiled-meta opacity-55">{copy.preview}</p>
          {renderStep()}
        </div>

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(step - 1)}
            >
              {t.back}
            </Button>
          )}
          <Button
            type="button"
            variant="yellow"
            className="flex-1"
            loading={submitting}
            onClick={() => {
              if (step < 4) {
                setStep(step + 1);
              } else {
                void submit(true);
              }
            }}
          >
            {step === 4
              ? t.finish
              : step === 1 && ageGroup === ""
                ? t.skip
                : t.next}
            <ArrowRight className="size-4" />
          </Button>

          {step < 4 && (
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => void submit(true)}
            >
              {t.skip}
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
}

function MembershipPage() {
  const copy = useCopy().public.membership;
  const live = useLiveData();
  const [message, setMessage] = useState<string>(copy.defaultMessage);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "EXPRESS" | "PAYPAL" | "CARD" | "SEPA" | undefined
  >();
  const [checkoutPromoCode, setCheckoutPromoCode] = useState("");

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel tone="white" className="space-y-6">
        <Badge tone="yellow">{copy.badge}</Badge>
        <div>
          <h1 className="headline-lg">{copy.plan}</h1>
          <p className="mt-3 text-4xl font-black">{copy.price}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {copy.body}
          </p>
        </div>
        <Badge
          tone={
            live.billingDisplay.subscriptionStatusLabel === "Active"
              ? "success"
              : "yellow"
          }
        >
          {live.billingDisplay.subscriptionStatusLabel}
        </Badge>
        <Divider />
        <div className="grid gap-3">
          {copy.perks.map((perk) => (
            <Badge key={perk} tone="white" className="justify-start">
              <Check className="size-3" />
              {perk}
            </Badge>
          ))}
        </div>
      </Panel>

      <Panel tone="cream" className="space-y-5">
        <div>
          <p className="unveiled-meta">{copy.paymentMethod}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-55">
            {copy.paymentHelper}
          </p>
        </div>
        <div className="grid gap-3">
          {[
            ["EXPRESS", "Apple Pay / Google Pay"],
            ["PAYPAL", "PayPal"],
            ["CARD", "Card"],
            ["SEPA", "SEPA Direct Debit"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                "flex items-center justify-between border-4 border-brand-dark bg-white px-4 py-4 text-left text-xs font-black uppercase tracking-widest",
                selectedPaymentMethod === id && "bg-brand-dark text-white",
              )}
              onClick={() =>
                setSelectedPaymentMethod(
                  id as "EXPRESS" | "PAYPAL" | "CARD" | "SEPA",
                )
              }
            >
              {label}
              <CreditCard className="size-4" />
            </button>
          ))}
        </div>
        <Field label={copy.promoCode}>
          <TextInput
            name="promoCode"
            placeholder={copy.optional}
            value={checkoutPromoCode}
            onChange={(e) => setCheckoutPromoCode(e.target.value)}
          />
        </Field>
        <Button
          type="button"
          className="w-full"
          onClick={() =>
            void runServerAction(
              () =>
                actions.updateMembership({
                  paymentMethod: selectedPaymentMethod,
                  promoCode: checkoutPromoCode,
                  isFrozen: false,
                  isActive:
                    live.billingDisplay.subscriptionStatusLabel === "Active",
                }),
              setMessage,
              live.refetchActiveSurface,
            )
          }
        >
          {copy.continueCheckout}
        </Button>
        <p className="text-xs font-bold uppercase tracking-widest opacity-55">
          {message}
        </p>
      </Panel>
    </div>
  );
}

function DiscoveryFilterPanel() {
  const copy = useCopy().discovery;
  const live = useLiveData();
  const [filters, setFilters] = useState<DiscoveryFilters>(
    live.discoveryFilters,
  );
  const updateFilter = (patch: DiscoveryFilters) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    live.setDiscoveryFilters?.(next);
  };

  return (
    <Panel
      tone="white"
      shadow={false}
      className="grid gap-4 p-4 md:grid-cols-4"
    >
      <Field label={copy.startDate}>
        <TextInput
          type="date"
          value={filters.startDate ?? ""}
          onChange={(event) => updateFilter({ startDate: event.target.value })}
        />
      </Field>
      <Field label={copy.endDate}>
        <TextInput
          type="date"
          value={filters.endDate ?? ""}
          onChange={(event) => updateFilter({ endDate: event.target.value })}
        />
      </Field>
      <Field label={copy.category}>
        <SelectInput
          value={filters.category ?? ""}
          onChange={(event) => updateFilter({ category: event.target.value })}
        >
          <option value="">{copy.allCategories}</option>
          {live.publicCategories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label={copy.partner}>
        <SelectInput
          value={filters.partnerId ?? ""}
          onChange={(event) => updateFilter({ partnerId: event.target.value })}
        >
          <option value="">{copy.allPartners}</option>
          {live.publicPartnerOptions.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </SelectInput>
      </Field>
    </Panel>
  );
}

function BookingModal({
  event,
  onClose,
}: {
  event: EventCardView;
  onClose: () => void;
}) {
  const copy = useCopy().booking;
  const live = useLiveData();
  const isGuest = !live.profile.email;
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<
    | null
    | { state: "confirmed"; code: string; url?: string }
    | { state: "waitlist" }
    | { state: "failure"; message: string; waitlistAvailable?: boolean }
  >(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const total = count * event.creditPrice;
  const success = result?.state === "confirmed" || result?.state === "waitlist";
  const membershipBlocked = event.bookingAvailabilityState === "frozen";
  const calendarMetadata = event.calendarMetadata;
  const calendarAvailable = isBookingCalendarActionAvailable(
    result?.state,
    calendarMetadata,
  );

  return (
    <ModalShell
      modal={{
        ...demoModalShell,
        heading: event.title,
        metadata: `${event.category} // ${event.partnerName}`,
        layout: success ? "single" : "split",
      }}
      onAction={(actionId) => {
        if (actionId === "close-modal") onClose();
      }}
    >
      {success ? (
        <div className="lg:col-span-2">
          <div className="mx-auto max-w-5xl space-y-10 text-center">
            <h2 className="headline-xl">
              {result?.state === "waitlist"
                ? copy.waitlistSuccess
                : copy.success}
            </h2>
            <div className="grid gap-6 text-left md:grid-cols-2">
              {result?.state === "confirmed" ? (
                <Panel tone={event.ticketType === "Voucher" ? "dark" : "white"}>
                  <p className="unveiled-meta opacity-55">
                    {event.ticketType === "Voucher"
                      ? copy.ticketCode
                      : copy.passwordToEnter}
                  </p>
                  <p className="mt-6 break-all font-display text-5xl font-black uppercase">
                    {result.code}
                  </p>
                  {result.url ? (
                    <p className="mt-4 break-all text-sm font-bold opacity-65">
                      {result.url}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    className="mt-8"
                    variant={
                      copied
                        ? "copied"
                        : event.ticketType === "Voucher"
                          ? "yellow"
                          : "primary"
                    }
                    onClick={() => setCopied(true)}
                  >
                    {copied ? <Check /> : <Copy />}
                    {copied ? copy.copied : copy.copyCode}
                  </Button>
                </Panel>
              ) : (
                <Panel tone="white">
                  <p className="unveiled-meta opacity-55">{copy.waitlist}</p>
                  <p className="headline-md mt-5">{copy.onList}</p>
                  <p className="mt-4 text-sm font-bold opacity-70">
                    {copy.waitlistBody}
                  </p>
                </Panel>
              )}
              {calendarAvailable && calendarMetadata ? (
                <Panel
                  tone="dark"
                  className="flex flex-col justify-between gap-8"
                >
                  <div>
                    <p className="unveiled-meta opacity-55">{copy.saveDate}</p>
                    <p className="headline-md mt-5">{copy.markMoment}</p>
                  </div>
                  <Button
                    type="button"
                    variant="yellow"
                    data-testid="booking-calendar-download"
                    onClick={() => downloadCalendarFile(calendarMetadata)}
                  >
                    <Calendar />
                    {copy.sync}
                  </Button>
                </Panel>
              ) : null}
            </div>
            <Button type="button" variant="link" onClick={onClose}>
              {copy.returnFeed}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-8">
            <div>
              <p className="unveiled-meta opacity-45">
                {event.category}
                {" // "}
                {event.partnerName}
              </p>
              <h2 className="headline-lg mt-4">{event.title}</h2>
            </div>
            <p className="max-w-2xl text-xl font-bold leading-relaxed opacity-80">
              {event.description}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 border-t-2 border-brand-dark/15 pt-6">
              <div>
                <p className="unveiled-meta opacity-45">
                  {live.profile.language === "DE" ? "ZEITPUNKT" : "WHEN"}
                </p>
                <p className="mt-2 text-2xl font-black uppercase tracking-tight">
                  {event.dateLabel}
                </p>
              </div>
              <div>
                <p className="unveiled-meta opacity-45">{copy.location}</p>
                <p className="mt-2 text-2xl font-black uppercase tracking-tight">
                  {event.address}
                </p>
              </div>
            </div>
            {!isGuest && (
              <Panel tone="cream" shadow={false} className="p-4">
                <p className="unveiled-meta">{copy.gateCopy}</p>
                <p className="mt-2 text-sm font-bold">{copy.gateMessage}</p>
                {result?.state === "failure" ? (
                  <p className="mt-4 border-t-2 border-brand-dark/20 pt-4 text-sm font-black uppercase text-red-700">
                    {result.message}
                    {result.waitlistAvailable ? copy.joinInstead : ""}
                  </p>
                ) : null}
              </Panel>
            )}
          </section>

          {isGuest ? (
            <Panel
              tone="dark"
              className="space-y-8 flex flex-col justify-between"
            >
              <div>
                <p className="unveiled-meta opacity-55 text-white">
                  {live.profile.language === "DE"
                    ? "PREMIUM-ZUGANG"
                    : "PREMIUM ACCESS"}
                </p>
                <p className="headline-md mt-5 text-white">
                  {live.profile.language === "DE"
                    ? "Werde Unveiled-Mitglied, um dieses Event zu buchen."
                    : "Join Unveiled to book this event."}
                </p>
              </div>
              <Button
                type="button"
                variant="yellow"
                className="w-full justify-center"
                onClick={() => {
                  window.location.assign(`/?callbackURL=/discover`);
                }}
              >
                {live.profile.language === "DE"
                  ? "Jetzt beitreten"
                  : "Join Unveiled to Book"}
                <ArrowRight />
              </Button>
            </Panel>
          ) : (
            <Panel tone="dark" className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <span className="unveiled-meta">{copy.tickets}</span>
                <div className="flex items-center gap-7 font-display text-5xl font-black">
                  <button
                    type="button"
                    onClick={() => setCount(Math.max(1, count - 1))}
                  >
                    <Minus />
                  </button>
                  {count}
                  <button
                    type="button"
                    onClick={() => setCount(Math.min(3, count + 1))}
                  >
                    <Plus />
                  </button>
                </div>
              </div>
              <Divider className="bg-brand-yellow/25" />
              <div className="flex items-end justify-between gap-4">
                <span className="unveiled-meta opacity-55">{copy.total}</span>
                <span className="font-display text-5xl font-black uppercase">
                  {total} credits
                </span>
              </div>
              <Button
                type="button"
                variant="yellow"
                className="w-full"
                disabled={submitting || membershipBlocked}
                onClick={async () => {
                  setResult(null);
                  setCopied(false);
                  if (membershipBlocked) {
                    setResult({
                      state: "failure",
                      message: event.membershipCta ?? copy.membershipRequired,
                    });
                    return;
                  }
                  setSubmitting(true);
                  const response =
                    event.remainingCapacity === 0
                      ? await actions.joinWaitlist({
                          eventId: event.id,
                          ticketQuantity: count,
                        })
                      : await actions.bookEvent({
                          eventId: event.id,
                          ticketQuantity: count,
                          idempotencyKey: crypto.randomUUID(),
                        });

                  setSubmitting(false);
                  if (response.error || !response.data) {
                    setResult({
                      state: "failure",
                      message: copy.requestFailed,
                    });
                    return;
                  }

                  if (!response.data.ok) {
                    setResult({
                      state: "failure",
                      message: response.data.formError ?? copy.checkFields,
                      waitlistAvailable: event.remainingCapacity === 0,
                    });
                    return;
                  }

                  const data = response.data.data;
                  if (data?.state === "confirmed") {
                    live.refetchActiveSurface();
                    setResult({
                      state: "confirmed",
                      code: data.redemption.code,
                      url: data.redemption.url,
                    });
                    return;
                  }

                  if (data?.state === "waitlist") {
                    live.refetchActiveSurface();
                    setResult({ state: "waitlist" });
                  }
                }}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : event.remainingCapacity === 0 ? (
                  copy.joinWaitlist
                ) : (
                  copy.confirm
                )}
                <ArrowRight />
              </Button>
            </Panel>
          )}
        </>
      )}
    </ModalShell>
  );
}

function MemberFeed({
  selectedEvent,
  setSelectedEvent,
  bookingEvent,
  setBookingEvent,
}: {
  selectedEvent: EventCardView | null;
  setSelectedEvent: (event: EventCardView | null) => void;
  bookingEvent: EventCardView | null;
  setBookingEvent: (event: EventCardView | null) => void;
}) {
  const copy = useCopy();
  const live = useLiveData();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const visible = useMemo(() => live.events, [live.events]);
  const mapProvider = readDiscoveryMapProviderConfig(
    import.meta.env as { PUBLIC_GOOGLE_MAPS_API_KEY?: string },
  );
  const discovery = {
    ...demoDiscoveryShell,
    filtersOpen,
    mapOpen,
    visibleResultCount: visible.length,
    resultCountLabel: live.visibleEventCountLabel,
    activeRangeLabel: live.activeRangeLabel,
    activeFilterCount: live.activeFilterCount,
    filterToggleLabel: copy.discovery.refine,
    mapToggleLabel: copy.discovery.map,
    emptyState: {
      state: live.isLoading ? "loading" : live.isError ? "error" : "empty",
      title: live.isLoading
        ? copy.discovery.loadingEvents
        : copy.discovery.noMatchingEvents,
      message: live.isError
        ? copy.discovery.liveError
        : copy.discovery.noMatches,
      retryAction: {
        id: "reset-all",
        label: copy.discovery.resetAll,
      },
    },
  } as const;
  const gateBlocked = visible.some(
    (event) => event.bookingAvailabilityState === "frozen",
  );
  const [feedMessage, setFeedMessage] = useState("");

  useEffect(() => {
    if (selectedEvent && !mapOpen) {
      setMapOpen(true);
    }
  }, [mapOpen, selectedEvent]);

  return (
    <div className="space-y-6">
      <Panel tone="white">
        <Badge tone="yellow">{copy.member.feedBadge}</Badge>
        <h1 className="headline-lg mt-5">{copy.member.feedTitle}</h1>
      </Panel>
      {gateBlocked ? (
        <Panel tone="cream" shadow={false} className="p-4">
          <p className="unveiled-meta">{copy.member.membershipGate}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest">
            {copy.member.billingGate}
          </p>
        </Panel>
      ) : null}
      {feedMessage ? (
        <Panel tone="white" shadow={false} className="p-4">
          <p className="text-sm font-bold uppercase tracking-widest">
            {feedMessage}
          </p>
        </Panel>
      ) : null}
      <DiscoveryShell
        discovery={discovery}
        filterPanel={<DiscoveryFilterPanel />}
        mapPanel={
          <DiscoveryMapPanel
            events={visible}
            surface="member"
            providerKey={mapProvider.key}
            actionLabel={copy.discovery.continueBooking}
            selectedMarkerIdOverride={selectedEvent?.id ?? null}
            onOpenEvent={(event) => {
              setSelectedEvent(event);
              setBookingEvent(event);
            }}
            onRetry={live.refetchActiveSurface}
          />
        }
        onAction={(actionId) => {
          if (actionId === "toggle-filters") {
            setFiltersOpen((open) => !open);
            setMapOpen(false);
          }
          if (actionId === "toggle-map") {
            setMapOpen((open) => !open);
            setFiltersOpen(false);
          }
          if (actionId === "reset-all") {
            live.setDiscoveryFilters?.({});
            live.refetchActiveSurface();
          }
        }}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {visible.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpen={(event) => {
                setSelectedEvent(event);
                setBookingEvent(event);
              }}
              onSave={(selectedEvent) =>
                void runServerAction(
                  () =>
                    selectedEvent.saved
                      ? actions.unsaveMemberEvent({
                          eventId: selectedEvent.id,
                        })
                      : actions.saveMemberEvent({
                          eventId: selectedEvent.id,
                        }),
                  setFeedMessage,
                  live.refetchActiveSurface,
                )
              }
            />
          ))}
          {visible.length === 0 ? (
            <StatePanel
              title={
                live.isLoading
                  ? copy.discovery.loadingEvents
                  : copy.discovery.noMatchingEvents
              }
              text={
                live.isError
                  ? copy.discovery.liveError
                  : copy.discovery.noMatches
              }
              state={
                live.isLoading ? "loading" : live.isError ? "error" : "empty"
              }
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={live.refetchActiveSurface}
                >
                  {copy.discovery.resetAll}
                </Button>
              }
            />
          ) : null}
        </div>
      </DiscoveryShell>
      {bookingEvent ? (
        <BookingModal
          key={bookingEvent.id}
          event={bookingEvent}
          onClose={() => setBookingEvent(null)}
        />
      ) : null}
    </div>
  );
}

function BookingsPage() {
  const allCopy = useCopy();
  const copy = allCopy.member;
  const bookingCopy = allCopy.booking;
  const live = useLiveData();

  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">{copy.bookingsBadge}</Badge>
        <h1 className="headline-lg mt-5">{copy.bookingsTitle}</h1>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        {live.bookings.map((booking) => (
          <Card key={booking.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge
                  tone={
                    booking.statusLabel === "Confirmed" ? "success" : "yellow"
                  }
                >
                  {booking.statusLabel}
                </Badge>
                <h2 className="mt-4 font-display text-4xl font-black uppercase leading-none">
                  {booking.eventTitle}
                </h2>
                <p className="mt-2 unveiled-meta opacity-45">
                  {booking.partnerName}
                </p>
              </div>
              <Badge tone="white">
                {booking.ticketCount} {copy.tickets}
              </Badge>
            </div>
            <Divider className="my-6" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="unveiled-meta opacity-45">{booking.dateLabel}</p>
                <p className="mt-1 text-xs font-bold uppercase opacity-45">
                  {booking.eventAddress}
                </p>
                <p className="font-display text-3xl font-black uppercase">
                  {booking.redemptionCode}
                </p>
                {booking.redemptionUrl ? (
                  <p className="mt-2 break-all text-xs font-bold uppercase opacity-45">
                    {booking.redemptionUrl}
                  </p>
                ) : null}
                <p className="mt-2 text-xs font-bold uppercase opacity-45">
                  {booking.totalCredits} {copy.creditsSpent}
                </p>
              </div>
              <Button
                type="button"
                variant={booking.copied ? "copied" : "secondary"}
              >
                {booking.copied ? <Check /> : <Copy />}
                {booking.copied ? bookingCopy.copied : bookingCopy.copyCode}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {live.waitlistEntries.map((entry) => (
          <Card key={entry.id} className="p-6">
            <Badge tone="yellow">{entry.statusLabel}</Badge>
            <p className="headline-md mt-4">{entry.eventTitle}</p>
            <p className="mt-2 text-sm font-bold opacity-60">
              {entry.dateLabel} {" // "} {entry.eventAddress}
            </p>
            <p className="unveiled-meta mt-5 opacity-45">
              {entry.createdLabel}
            </p>
          </Card>
        ))}
      </div>
      <Panel tone="white">
        <Badge tone="yellow">{copy.creditLedger}</Badge>
        <div className="mt-5 space-y-3">
          {live.creditLedgerEntries.map((entry) => (
            <TableRow key={entry.id}>
              <span className="font-black uppercase">
                {entry.reasonLabel}
                {entry.relatedLabel ? ` // ${entry.relatedLabel}` : ""}
              </span>
              <span>{entry.createdLabel}</span>
              <span>
                {entry.actorLabel
                  ? `Actor: ${entry.actorLabel}`
                  : copy.memberActor}
              </span>
              <span className="font-black">
                {entry.amount > 0 ? "+" : ""}
                {entry.amount} credits
              </span>
            </TableRow>
          ))}
          {live.creditLedgerEntries.length === 0 ? (
            <StatePanel
              title={copy.noCreditHistory}
              text={copy.ledgerEmpty}
              state="empty"
            />
          ) : null}
        </div>
      </Panel>
      {live.bookings.length === 0 ? (
        <StatePanel
          title={live.isLoading ? copy.loadingBookings : copy.noBookings}
          text={live.isError ? copy.bookingsError : copy.bookingsEmpty}
          state={live.isLoading ? "loading" : live.isError ? "error" : "empty"}
          action={
            <Button type="button" variant="primary">
              {copy.browseEvents}
            </Button>
          }
        />
      ) : null}
      <Panel
        tone="dark"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <span className="unveiled-meta opacity-60">{copy.ticketQuestion}</span>
        <Button type="button" variant="yellow">
          support@unveiled.berlin
          <Mail />
        </Button>
      </Panel>
    </div>
  );
}

function ProfilePage() {
  const copy = useCopy().profile;
  const live = useLiveData();
  const [profileMessage, setProfileMessage] = useState<string>(
    copy.profileMessage,
  );
  const [membershipMessage, setMembershipMessage] = useState<string>(
    copy.membershipMessage,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "EXPRESS" | "PAYPAL" | "CARD" | "SEPA" | undefined
  >();
  const [preferenceMessage, setPreferenceMessage] = useState<string>(
    copy.preferenceMessage,
  );

  return (
    <div className="space-y-8 py-8">
      <Panel
        tone="white"
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <Badge tone="success">{live.profile.membershipStatus}</Badge>
          <h1 className="headline-lg mt-5">{live.profile.name}</h1>
          <p className="mt-2 text-sm font-black uppercase tracking-widest opacity-55">
            {live.profile.email}
          </p>
        </div>
        <StatPanel
          label={copy.wallet}
          value={`${live.profile.credits}`}
          caption={`${live.profile.credits} credits`}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          tone="cream"
          shadow={false}
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(
              event.currentTarget as HTMLFormElement,
            );
            void runServerAction(
              () =>
                actions.updateProfile({
                  firstName: String(formData.get("firstName") || ""),
                  lastName: String(formData.get("lastName") || ""),
                  language: String(formData.get("language") || "DE"),
                  billingAddress: String(formData.get("billingAddress") || ""),
                  newsletterOptIn: formData.get("newsletterOptIn") === "on",
                }),
              setProfileMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="unveiled-meta">{copy.identity}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {profileMessage}
          </p>
          <Field label={copy.name} className="mt-5">
            <TextInput name="firstName" defaultValue={live.profile.firstName} />
          </Field>
          <Field label={copy.lastName} className="mt-4">
            <TextInput name="lastName" defaultValue={live.profile.lastName} />
          </Field>
          <Field label={copy.email} className="mt-4">
            <TextInput defaultValue={live.profile.email} disabled />
          </Field>
          <Field label={copy.billingAddress} className="mt-4">
            <TextInput
              name="billingAddress"
              defaultValue={live.profile.billingAddress}
              placeholder="Berlin"
            />
          </Field>
          <Field label={copy.language} className="mt-4">
            <SelectInput name="language" defaultValue={live.profile.language}>
              <option value="DE">DE</option>
              <option value="EN">EN</option>
            </SelectInput>
          </Field>
          <label className="mt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <input
              name="newsletterOptIn"
              type="checkbox"
              defaultChecked={live.profile.newsletterOptIn}
            />
            {copy.newsletter}
          </label>
          <a
            className="mt-4 block text-[10px] font-black uppercase tracking-widest underline"
            href="/api/account/password-recovery"
          >
            {copy.passwordRecovery}
          </a>
          <Button type="submit" className="mt-5" variant="secondary">
            {copy.saveProfile}
          </Button>
        </Panel>
        <Panel
          tone="white"
          shadow={false}
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(
              event.currentTarget as HTMLFormElement,
            );
            void runServerAction(
              () =>
                actions.updateMembership({
                  paymentMethod: selectedPaymentMethod,
                  promoCode: String(formData.get("promoCode") || ""),
                  isFrozen: false,
                  isActive: false,
                }),
              setMembershipMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="unveiled-meta">{copy.billing}</p>
          <p className="headline-md mt-5">{live.billingDisplay.planLabel}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {live.billingDisplay.planPriceLabel} {" // "}
            {live.profile.monthlyCredits} {copy.creditsMonthly}
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {live.billingDisplay.subscriptionStatusLabel} {" // "}
            {live.billingDisplay.paymentMethodDisplay} {" // "}
            {copy.renews} {live.billingDisplay.nextBillDateLabel}
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {membershipMessage}
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="unveiled-meta opacity-55">Express</p>
              <button
                type="button"
                className={cn(
                  "mt-2 flex w-full items-center justify-center gap-2 border-4 border-brand-dark px-4 py-4 text-sm font-black uppercase tracking-widest",
                  selectedPaymentMethod === "EXPRESS"
                    ? "bg-brand-dark text-white"
                    : "bg-brand-yellow text-brand-dark",
                )}
                onClick={() => setSelectedPaymentMethod("EXPRESS")}
              >
                <CreditCard className="size-4" />
                Apple Pay / Google Pay
              </button>
            </div>
            <div>
              <p className="unveiled-meta opacity-55">PayPal</p>
              <button
                type="button"
                className={cn(
                  "mt-2 flex w-full items-center justify-center gap-2 border-4 border-brand-dark px-4 py-3 text-sm font-black uppercase tracking-widest",
                  selectedPaymentMethod === "PAYPAL"
                    ? "bg-brand-dark text-white"
                    : "bg-white text-brand-dark",
                )}
                onClick={() => setSelectedPaymentMethod("PAYPAL")}
              >
                PayPal
              </button>
            </div>
            <div>
              <p className="unveiled-meta opacity-55">{copy.standard}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["CARD", "SEPA"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={cn(
                      "border-4 border-brand-dark px-3 py-3 text-[10px] font-black uppercase tracking-widest",
                      selectedPaymentMethod === method
                        ? "bg-brand-dark text-white"
                        : "bg-brand-grey text-brand-dark",
                    )}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    {method === "CARD" ? "Card" : "SEPA Direct Debit"}
                  </button>
                ))}
              </div>
              {selectedPaymentMethod === "CARD" ? (
                <Panel tone="cream" shadow={false} className="mt-3 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                    {copy.stripeCard}
                  </p>
                </Panel>
              ) : null}
              {selectedPaymentMethod === "SEPA" ? (
                <Panel tone="cream" shadow={false} className="mt-3 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                    {copy.stripeSepa}
                  </p>
                </Panel>
              ) : null}
            </div>
          </div>
          <Field label={copy.promoCode} className="mt-4">
            <TextInput name="promoCode" placeholder="Optional" />
          </Field>
          <Button type="submit" variant="secondary" className="mt-6">
            <CreditCard />
            {copy.startCheckout}
          </Button>
        </Panel>
        <Panel
          tone="dark"
          shadow={false}
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runServerAction(
              () =>
                actions.saveOnboarding({
                  ageGroup: "26-35",
                  interests: ["Theater", "Kino"],
                  moods: ["Leicht"],
                  districts: ["Mitte"],
                  maxDistance: 10,
                  timing: ["After Work"],
                  preferredDays: ["Fr"],
                  preferredLanguages: ["DE"],
                  accessibility: false,
                  onboardingComplete: true,
                }),
              setPreferenceMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="unveiled-meta opacity-55">{copy.vibes}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">
            {preferenceMessage}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {live.profile.vibes.map((vibe) => (
              <Badge key={vibe} tone="yellow">
                <Heart className="size-3" />
                {vibe}
              </Badge>
            ))}
            {live.profile.vibes.length === 0 ? (
              <Badge tone="white">{copy.noPreferences}</Badge>
            ) : null}
          </div>
          <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
            <Loader2 className="size-4 animate-spin" />
            {copy.loadingPreview}
          </div>
          <Button type="submit" variant="yellow" className="mt-6">
            {copy.saveOnboarding}
          </Button>
        </Panel>
      </div>
    </div>
  );
}

function PartnerPortal() {
  const live = useLiveData();
  const [checkInMessage, setCheckInMessage] = useState(
    "Check-in actions enforce partner ownership on the server.",
  );
  const [guestSearch, setGuestSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const filteredGuests = useMemo(() => {
    const search = guestSearch.trim().toLowerCase();
    return live.partnerGuests.filter((guest) => {
      const matchesSearch =
        !search ||
        [guest.name, guest.email, guest.eventTitle, guest.exportCode]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesEvent = !eventFilter || guest.eventId === eventFilter;
      return matchesSearch && matchesEvent;
    });
  }, [eventFilter, guestSearch, live.partnerGuests]);

  return (
    <div className="space-y-8 py-8">
      <Panel
        tone="white"
        className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end"
      >
        <div>
          <Badge tone="yellow">Partner portal</Badge>
          <h1 className="headline-lg mt-5">
            {live.partner?.name ?? "Partner portal"}.
          </h1>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {live.partner?.address ?? "Partner address unavailable"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatPanel
            label="Total guests"
            value={live.partnerGuestTotal.replace(" guests", "")}
            caption="Across selected event"
          />
          <Panel tone="cream" shadow={false} className="p-5">
            <QrCode className="size-8" />
            <p className="mt-4 unveiled-meta">Venue QR</p>
            {live.partner?.venueQrUrl ? (
              <Button
                type="button"
                variant="copied"
                className="mt-4 w-full h-auto whitespace-normal break-all text-left min-w-0"
              >
                <Check className="shrink-0" />
                <span className="min-w-0 break-all">
                  {live.partner.venueQrUrl}
                </span>
              </Button>
            ) : (
              <Badge tone="white" className="mt-4">
                Missing token
              </Badge>
            )}
          </Panel>
        </div>
      </Panel>
      <Panel
        tone="white"
        shadow={false}
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <Field label="Search guests">
          <TextInput
            placeholder="Name, email, event, or code"
            value={guestSearch}
            onChange={(event) => setGuestSearch(event.currentTarget.value)}
          />
        </Field>
        <Field label="Event">
          <SelectInput
            value={eventFilter}
            onChange={(event) => setEventFilter(event.currentTarget.value)}
          >
            <option value="">All events</option>
            {live.partnerEventOptions.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Button
          type="button"
          className="self-end"
          variant="secondary"
          onClick={() =>
            void runServerAction(
              () =>
                actions.getPartnerBookingExportRows({
                  eventId: eventFilter || undefined,
                }),
              setCheckInMessage,
              (data) => {
                const downloaded = downloadCsv(
                  "partner-guests.csv",
                  data?.rows ?? [],
                  [
                    "bookingId",
                    "userId",
                    "event",
                    "code",
                    "status",
                    "tickets",
                    "createdAt",
                  ],
                );
                setCheckInMessage(
                  downloaded ? "CSV export downloaded." : "No export rows.",
                );
              },
            )
          }
        >
          <Download />
          Download CSV
        </Button>
      </Panel>
      <TableShell>
        {filteredGuests.map((guest) => (
          <TableRow key={guest.bookingId}>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">
                {guest.name}
              </p>
              <p className="text-xs font-bold opacity-55">{guest.email}</p>
            </div>
            <p className="text-sm font-bold">{guest.eventTitle}</p>
            <Badge tone={guest.statusLabel === "Waitlist" ? "grey" : "yellow"}>
              {guest.statusLabel}
            </Badge>
            <Button
              type="button"
              variant={
                guest.checkedInLabel === "Checked in" ? "copied" : "primary"
              }
              disabled={guest.checkInDisabled}
              onClick={() =>
                void runServerAction(
                  () =>
                    actions.checkInBooking({
                      bookingId: guest.bookingId,
                      partnerId: live.partner?.id ?? "",
                    }),
                  setCheckInMessage,
                  live.refetchActiveSurface,
                )
              }
            >
              {guest.checkedInLabel}
            </Button>
          </TableRow>
        ))}
        {filteredGuests.length === 0 ? (
          <StatePanel
            title={live.isLoading ? "Loading guests" : "No guests"}
            text={
              live.isError
                ? "Live partner data could not be loaded."
                : "Search and event filters can render an empty guest list state."
            }
            state={
              live.isLoading ? "loading" : live.isError ? "error" : "empty"
            }
          />
        ) : null}
      </TableShell>
      <Panel tone="cream" shadow={false} className="p-4">
        <p className="unveiled-meta">Check-in status</p>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest">
          {checkInMessage}
        </p>
      </Panel>
    </div>
  );
}

function AdminPanel() {
  const live = useLiveData();
  const [adminMessage, setAdminMessage] = useState(
    "Admin forms submit through authorized Astro Actions.",
  );
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
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

  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">Admin</Badge>
        <h1 className="headline-lg mt-5">Operations overview.</h1>
      </Panel>
      <div className="grid gap-4 md:grid-cols-3">
        {live.adminDashboardMetrics.map((metric) => (
          <StatPanel key={metric.label} {...metric} />
        ))}
      </div>
      <Panel tone="dark" className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="yellow" onClick={scrollToAdminEventForm}>
          New event
          <Plus />
        </Button>
        <Button type="button" variant="secondary" onClick={scrollToAdminExport}>
          Partner export
          <ArrowDownToLine />
        </Button>
      </Panel>
      <TableShell>
        {live.adminEvents.map((event) => (
          <TableRow key={event.id}>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">
                {event.title}
              </p>
              <p className="text-xs font-bold opacity-55">
                {event.partnerName}
              </p>
            </div>
            <p className="text-sm font-bold uppercase">{event.dateLabel}</p>
            <p className="text-sm font-bold uppercase">{event.capacityLabel}</p>
            <p className="text-xs font-black uppercase tracking-widest opacity-55">
              {event.codeStrategyLabel} {" // "}
              {event.creditPrice} credits
            </p>
            <Badge tone={event.statusLabel === "Draft" ? "grey" : "yellow"}>
              {event.statusLabel}
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() =>
                void runServerAction(
                  () => actions.deleteEvent({ eventId: event.id }),
                  setAdminMessage,
                  live.refetchActiveSurface,
                )
              }
            >
              Delete
            </Button>
          </TableRow>
        ))}
        {live.adminEvents.length === 0 ? (
          <StatePanel
            title={live.isLoading ? "Loading events" : "No admin events"}
            text={
              live.isError
                ? "Live admin data could not be loaded."
                : "Admin event rows will appear after events are created."
            }
            state={
              live.isLoading ? "loading" : live.isError ? "error" : "empty"
            }
          />
        ) : null}
      </TableShell>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          id="admin-event-form"
          tone="white"
          shadow={false}
          className="scroll-mt-24 space-y-5"
          as="form"
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
            setAdminMessage("Publishing event...");

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
                    enabled: false,
                    count: 1,
                    intervalDays: 7,
                    slotIsoDateTimes: [],
                  },
                }),
              setAdminMessage,
              () => {
                form.reset();
                setEventImageUrl("");
                setTicketType("SECRET_CODE");
                setSecretCodeMode("MANUAL");
                live.refetchActiveSurface();
              },
            );
            setEventSubmitting(false);
          }}
        >
          <p className="headline-md">Event form</p>
          <p className="text-xs font-bold uppercase tracking-widest opacity-55">
            {adminMessage}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <TextInput name="title" placeholder="Event title" required />
            </Field>
            <Field label="Partner">
              <SelectInput name="partnerId" required>
                {live.adminPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Date">
              <TextInput
                name="date"
                type="date"
                defaultValue="2026-05-04"
                required
              />
            </Field>
            <Field label="Time">
              <TextInput
                name="time"
                type="time"
                defaultValue="19:00"
                required
              />
            </Field>
            <Field label="Credits">
              <TextInput
                name="credits"
                type="number"
                min={0}
                defaultValue={2}
                required
              />
            </Field>
            <Field label="Capacity">
              <TextInput
                name="capacity"
                type="number"
                min={1}
                defaultValue={1}
                required
              />
            </Field>
            <Field label="Category">
              <SelectInput name="category" required>
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
            <Field label="Ticket Type">
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
                <Field label="Promo Code">
                  <TextInput
                    name="promoCode"
                    placeholder="Promo code"
                    required
                  />
                </Field>
                <Field label="Event Website URL">
                  <TextInput
                    name="eventWebsiteUrl"
                    type="url"
                    placeholder="https://..."
                    required
                  />
                </Field>
              </>
            )}
            {ticketType === "SECRET_CODE" && (
              <>
                <Field label="Secret Code Mode">
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
                    <option value="SHARED_GENERATED">Shared Generated</option>
                    <option value="UNIQUE_PER_BOOKING">
                      Unique Per Booking
                    </option>
                  </SelectInput>
                </Field>
                {secretCodeMode === "MANUAL" && (
                  <Field label="Secret Code">
                    <TextInput
                      name="secretCode"
                      placeholder="Secret code"
                      required
                    />
                  </Field>
                )}
              </>
            )}

            <Field label="Address">
              <TextInput
                name="address"
                defaultValue="Berlin"
                placeholder="Event address"
                required
              />
            </Field>
            <Field label="Neighborhood">
              <TextInput
                name="neighborhood"
                defaultValue="Mitte"
                placeholder="Neighborhood (e.g. Mitte)"
                required
              />
            </Field>

            <Field label="Languages" className="sm:col-span-2">
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input
                    type="checkbox"
                    name="languages"
                    value="DE"
                    defaultChecked
                  />{" "}
                  DE
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input type="checkbox" name="languages" value="EN" /> EN
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input type="checkbox" name="languages" value="TR" /> Turki
                  (TR)
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input type="checkbox" name="languages" value="AR" /> Arabic
                  (AR)
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input type="checkbox" name="languages" value="NON_VERBAL" />{" "}
                  Non-Verbal
                </label>
              </div>
            </Field>

            <Field label="Target Age Groups" className="sm:col-span-2">
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input type="checkbox" name="targetAgeGroups" value="18-25" />{" "}
                  18-25
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input
                    type="checkbox"
                    name="targetAgeGroups"
                    value="26-35"
                    defaultChecked
                  />{" "}
                  26-35
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input type="checkbox" name="targetAgeGroups" value="36-50" />{" "}
                  36-50
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <input type="checkbox" name="targetAgeGroups" value="50+" />{" "}
                  50+
                </label>
              </div>
            </Field>
          </div>
          <Field label="Optional info">
            <TextArea
              name="description"
              placeholder="Door notes, redemption details, image alt text"
            />
          </Field>
          <AdminAssetUploadField
            kind="event"
            label="Event image"
            ownerId="event-draft"
            value={eventImageUrl}
            onUrlChange={setEventImageUrl}
            testId="admin-event-image-upload"
            className="sm:col-span-2"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={eventSubmitting}>
              Publish event
            </Button>
          </div>
        </Panel>
        <Panel tone="cream" shadow={false} className="space-y-5">
          <p className="headline-md">Series builder</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date range">
              <TextInput defaultValue="04 May - 30 May" />
            </Field>
            <Field label="Weekdays">
              <TextInput defaultValue="Mon, Wed, Fri" />
            </Field>
            <Field label="Times">
              <TextInput defaultValue="19:00, 21:00" />
            </Field>
            <Field label="Excluded dates">
              <TextInput defaultValue="12 May" />
            </Field>
          </div>
          <div className="grid gap-2">
            {derivedValues.seriesPreview.map((slot) => (
              <Badge key={slot} tone="white">
                {slot}
              </Badge>
            ))}
          </div>
        </Panel>
        <Panel
          tone="white"
          shadow={false}
          className="space-y-5"
          as="form"
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
                  name: String(formData.get("name") || ""),
                  contactEmail: String(formData.get("contactEmail") || ""),
                  address: String(formData.get("address") || "Berlin"),
                  logoUrl: String(formData.get("logoUrl") || ""),
                }),
              setAdminMessage,
              () => {
                form.reset();
                setPartnerLogoUrl("");
                live.refetchActiveSurface();
              },
            );
            setPartnerSubmitting(false);
          }}
        >
          <p className="headline-md">Partners</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue name">
              <TextInput name="name" placeholder="Venue name" required />
            </Field>
            <Field label="Contact email">
              <TextInput
                name="contactEmail"
                type="email"
                placeholder="partner@example.com"
                required
              />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <TextInput name="address" placeholder="Berlin" required />
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
          <div className="grid gap-3">
            {live.adminPartners.map((partner) => (
              <div
                key={partner.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-brand-dark/20 pb-3"
              >
                <Badge tone="white">
                  {partner.name}
                  {" // "}
                  {partner.portalLoginLabel}
                  {" // "}
                  {partner.venueQrTokenLabel}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
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
                    onClick={() =>
                      void runServerAction(
                        () =>
                          actions.deletePartner({
                            partnerId: partner.id,
                          }),
                        setAdminMessage,
                        live.refetchActiveSurface,
                      )
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={partnerSubmitting}>
              Save
            </Button>
          </div>
        </Panel>
        <Panel
          tone="dark"
          shadow={false}
          className="space-y-4"
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(
              event.currentTarget as HTMLFormElement,
            );
            void runServerAction(
              () =>
                actions.adjustMemberCredits({
                  userId: String(formData.get("userId") || ""),
                  amount: Number(formData.get("creditAdjustment") || 0),
                  reason: "Admin panel adjustment",
                }),
              setAdminMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="headline-md">Members</p>
          <Field label="Search members" className="text-brand-yellow">
            <TextInput placeholder="Name or email" />
          </Field>
          <Button
            type="button"
            size="sm"
            variant="yellow"
            onClick={() =>
              void runServerAction(
                () => actions.listUsers({}),
                setAdminMessage,
                live.refetchActiveSurface,
              )
            }
          >
            Refresh users
          </Button>
          {live.adminMembers.map((member) => (
            <Card key={member.userId} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: admin panel toggle */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: admin panel toggle */}
                <div
                  className="cursor-pointer flex-1 min-w-[200px]"
                  onClick={() =>
                    setExpandedMemberId(
                      expandedMemberId === member.userId ? null : member.userId,
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black uppercase tracking-widest">
                      {member.fullName}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                      {expandedMemberId === member.userId
                        ? "(Hide Intel)"
                        : "(Show Intel)"}
                    </span>
                  </div>
                  <p className="text-xs font-bold opacity-55">
                    {member.subscriptionStatusLabel} {" // "}
                    {member.credits} credits {" // "}
                    {member.roleLabel}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-45">
                    {member.email} {" // "}
                    {member.bookingCount} bookings {" // "}
                    {member.savedCount} saved {" // "}
                    {member.waitlistCount} waitlist
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-45">
                    {member.providerStatus ?? "No provider"} {" // "}
                    {member.currentPeriodLabel} {" // "}
                    {member.historySummary}
                  </p>
                </div>
                <div className="flex gap-2">
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
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      void runServerAction(
                        () =>
                          actions.toggleUserFreeze({
                            userId: member.userId,
                            frozen:
                              member.billingOverrideActions.includes("freeze"),
                          }),
                        setAdminMessage,
                        live.refetchActiveSurface,
                      )
                    }
                  >
                    {member.billingOverrideActions.includes("freeze")
                      ? "Freeze"
                      : "Unfreeze"}
                  </Button>
                </div>
              </div>

              {expandedMemberId === member.userId && (
                <div className="mt-4 pt-4 border-t border-brand-dark/20 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">
                        Preferences
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest mt-2">
                        Age {member.preferences.ageGroup || "Unknown"} / Radius{" "}
                        {member.preferences.maxDistance}km /{" "}
                        {member.preferences.accessibility
                          ? "Accessible"
                          : "No accessibility flag"}
                      </div>
                      <div className="space-y-3">
                        {[
                          {
                            label: "Interests",
                            values: member.preferences.interests,
                          },
                          { label: "Moods", values: member.preferences.moods },
                          {
                            label: "Districts",
                            values: member.preferences.districts,
                          },
                          {
                            label: "Timing",
                            values: member.preferences.timing,
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
                          <div key={group.label} className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                              {group.label}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(group.values?.length
                                ? group.values
                                : ["None"]
                              ).map((value) => (
                                <Badge
                                  key={`${group.label}-${value}`}
                                  tone="white"
                                  className="text-[9px]"
                                >
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">
                        History
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Bookings
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.bookingCount}
                          </div>
                        </div>
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Waitlist
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.waitlistCount}
                          </div>
                        </div>
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Saved
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.savedCount}
                          </div>
                        </div>
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Sessions
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.sessionCount}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">
                        Behavior Intel
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Event Opens
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.eventOpenCount}
                          </div>
                        </div>
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Filter Applies
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.filterApplyCount}
                          </div>
                        </div>
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Saves
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.savedCount}
                          </div>
                        </div>
                        <div className="border border-brand-dark/20 p-2 rounded">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Unsaves
                          </div>
                          <div className="text-lg font-black tracking-tight">
                            {member.unsavedCount}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          Latest Signals
                        </div>
                        <div className="border border-brand-dark/20 p-2 rounded space-y-1 text-[9px] font-bold uppercase tracking-widest">
                          <div>Last View: {member.lastView || "Unknown"}</div>
                          <div>
                            Last Seen:{" "}
                            {member.lastSeenAt
                              ? new Date(member.lastSeenAt).toLocaleString()
                              : "Unknown"}
                          </div>
                          <div>
                            Last Booking: {member.lastBookedEventId || "None"}
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

                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          Recently Touched Events
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.recentEventIds.length === 0 ? (
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                              No tracked event opens.
                            </span>
                          ) : (
                            member.recentEventIds.map((eventId) => {
                              const matchingEvent =
                                live.events.find((e) => e.id === eventId) ||
                                live.adminEvents.find((e) => e.id === eventId);
                              return (
                                <Badge
                                  key={eventId}
                                  tone="yellow"
                                  className="text-[9px]"
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
                </div>
              )}

              <Divider className="my-4" />
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
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                History, preferences, bookings, and adjustment controls are
                expandable.
              </p>
            </Card>
          ))}
          {live.adminMembers.length === 0 ? (
            <StatePanel
              title={live.isLoading ? "Loading members" : "No members"}
              text={
                live.isError
                  ? "Live member rows could not be loaded."
                  : "Admin member rows will appear after members sign up."
              }
              state={
                live.isLoading ? "loading" : live.isError ? "error" : "empty"
              }
            />
          ) : null}
        </Panel>
      </div>
      <Panel
        id="admin-export-panel"
        tone="cream"
        shadow={false}
        className="scroll-mt-24 space-y-5"
      >
        <p className="headline-md">Export Bookings</p>
        <p className="text-xs font-bold uppercase tracking-widest opacity-55">
          {exportMessage}
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Export partner" className="min-w-64">
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
                (data) => {
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
                    downloaded ? "CSV export downloaded." : "No export rows.",
                  );
                },
              )
            }
          >
            Download CSV
            <ArrowDownToLine />
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function useLiveDataView(
  initialSurface: InitialSurfaceData | undefined,
  discoveryFilters: DiscoveryFilters,
  setDiscoveryFilters: (filters: DiscoveryFilters) => void,
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
  const adminQuery = useAdminDataQuery({
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

function VisualSystemAppContent({
  initialShell,
  initialDiscovery,
  initialView = "landing",
  callbackURL = "/",
}: {
  initialShell?: AppShellViewModel;
  initialDiscovery?: InitialSurfaceData;
  initialView?: View;
  callbackURL?: string;
}) {
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>(
    initialDiscovery && "filters" in initialDiscovery
      ? (initialDiscovery.filters ?? {})
      : {},
  );
  const [selectedEvent, setSelectedEvent] = useState<EventCardView | null>(
    null,
  );
  const [bookingEvent, setBookingEvent] = useState<EventCardView | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<UiLanguage>(
    initialShell?.language.selected ?? "DE",
  );
  const live = useLiveDataView(
    initialDiscovery,
    discoveryFilters,
    setDiscoveryFilters,
  );
  const [view, setView] = useState<View>(initialView);

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
  const pageShell =
    view === "member"
      ? memberPageShell
      : view === "partner"
        ? demoPageShells.partner
        : view === "admin"
          ? undefined
          : view === "discover"
            ? demoPageShells.public
            : undefined;
  const navigateShell = async (actionId: string) => {
    if (actionId === "new-event") {
      scrollToAdminEventForm();
      return;
    }

    if (actionId.startsWith("language:")) {
      const language = actionId.slice("language:".length);
      if (language === "DE" || language === "EN") {
        setSelectedLanguage(language);
        await actions.setLanguage({ language });
        live.refetchActiveSurface();
      }
      return;
    }
    const target = shellDemoViews.find((item) => item.id === actionId);
    if (target) setView(target.id as View);
    if (actionId === "membership") window.location.assign("/membership");
    if (actionId === "logo")
      setView(view === "partner" || view === "admin" ? view : "landing");
    if (actionId === "profile") setView("profile");
    if (actionId === "logout") {
      await fetch("/api/account/logout", { method: "POST" });
      window.location.assign("/");
    }
  };

  return (
    <LiveDataContext.Provider value={live}>
      <LanguageContext.Provider value={selectedLanguage}>
        <AppShell shell={shell} onAction={navigateShell}>
          <div className="pt-6">
            {!initialShell ? (
              <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
                {shellDemoViews.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    size="sm"
                    variant={view === item.id ? "active" : "secondary"}
                    onClick={() => setView(item.id as View)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
          <PageShell page={pageShell} onAction={navigateShell}>
            {view === "landing" ? (
              <LandingPage setView={setView} callbackURL={callbackURL} />
            ) : null}
            {view === "discover" ? <PublicDiscover /> : null}
            {view === "how" ? <HowItWorks /> : null}
            {view === "onboarding" ? <OnboardingPage /> : null}
            {view === "membership" ? <MembershipPage /> : null}
            {view === "faq" ? <FaqPage setView={setView} /> : null}
            {view === "member" ? (
              <MemberFeed
                selectedEvent={selectedEvent}
                setSelectedEvent={handleOpenEvent}
                bookingEvent={bookingEvent}
                setBookingEvent={setBookingEvent}
              />
            ) : null}
            {view === "bookings" ? <BookingsPage /> : null}
            {view === "profile" ? <ProfilePage /> : null}
            {view === "partner" ? <PartnerPortal /> : null}
            {view === "admin" ? <AdminPanel /> : null}
          </PageShell>
        </AppShell>
      </LanguageContext.Provider>
    </LiveDataContext.Provider>
  );
}

export function VisualSystemApp({
  initialShell,
  initialDiscovery,
  initialView = "landing",
  callbackURL = "/",
}: {
  initialShell?: AppShellViewModel;
  initialDiscovery?: unknown;
  initialView?: View;
  callbackURL?: string;
}) {
  const initialSurface = isInitialSurfaceData(initialDiscovery)
    ? initialDiscovery
    : undefined;

  return (
    <QueryProvider>
      <VisualSystemAppContent
        initialShell={initialShell}
        initialDiscovery={initialSurface}
        initialView={initialView}
        callbackURL={callbackURL}
      />
    </QueryProvider>
  );
}
