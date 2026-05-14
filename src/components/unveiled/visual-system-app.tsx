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
} from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

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
  ShellLogo,
} from "@/components/unveiled/app-shell";
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
import { formFailure } from "@/lib/forms/action-result";
import { applyFormActionResult } from "@/lib/forms/client-action";
import { loginSchema, passwordRecoverySchema, signupSchema } from "@/lib/forms/schemas";
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

const LiveDataContext = createContext<LiveDataView>(emptyLiveDataView);

function useLiveData() {
  return useContext(LiveDataContext);
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

function LandingPage({ 
  setView, 
  callbackURL = "/" 
}: { 
  setView: (view: View) => void;
  callbackURL?: string;
}) {
  const [mode, setMode] = useState<"login" | "signup" | "recovery">("login");
  const [formMessage, setFormMessage] = useState(
    "Use your member email to continue.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const activeSchema = 
    mode === "login" ? loginSchema : 
    mode === "signup" ? signupSchema : 
    passwordRecoverySchema;

  const form = useForm<AuthLandingValues>({
    resolver: zodResolver(activeSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      callbackURL: callbackURL || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("callbackURL") || "/" : "/"),
    },
  });

  async function submitAuth(values: AuthLandingValues) {
    setIsSubmitting(true);
    setFormMessage("");

    const result =
      mode === "login"
        ? await actions.login(values)
        : mode === "signup"
          ? await actions.signup(values)
          : await actions.passwordRecovery(values);

    const actionResult = result.error
      ? formFailure("The request could not be completed.")
      : result.data;

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
          <Badge tone="white">Berlin membership access</Badge>
          <h1 className="headline-xl max-w-4xl">
            Culture before it goes public.
          </h1>
          <p className="max-w-2xl text-lg font-bold leading-relaxed md:text-2xl">
            Unveiled recreates the legacy first impression: oversized display
            type, yellow field, thick black borders, compact labels, and direct
            CTAs.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={() => setView("discover")}>
            Explore access
            <ArrowRight />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setView("how")}
          >
            How it works
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "No public feed noise",
            "Credits included monthly",
            "Partner redemptions",
          ].map((label) => (
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
            onClick={() => { setMode("login"); setIsSuccess(false); }}
            type="button"
          >
            Login
          </button>
          <button
            className={cn(
              "flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest",
              mode === "signup" && "bg-brand-dark text-white",
            )}
            onClick={() => { setMode("signup"); setIsSuccess(false); }}
            type="button"
          >
            Register
          </button>
        </div>
        <div>
          <p className="headline-md">
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create access" : "Reset password"}
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-55">
            {mode === "recovery" ? "Enter your email to receive recovery instructions." : "Visible validation and notice panels match the legacy auth surface."}
          </p>
        </div>
        <Panel tone="cream" shadow={false} className="p-4">
          <p className="unveiled-meta">Notice</p>
          <p className="text-sm font-bold">
            {formMessage || "Use your member email to continue."}
          </p>
        </Panel>
        {isSuccess ? (
          <StatePanel
            state="success"
            title="Check your email"
            text="If an account exists for that email, recovery instructions have been sent."
            action={
              <Button type="button" variant="secondary" onClick={() => { setMode("login"); setIsSuccess(false); }}>
                Back to login
              </Button>
            }
          />
        ) : (
          <form className="grid gap-4" onSubmit={form.handleSubmit(submitAuth)}>
            {mode === "signup" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  error={form.formState.errors.firstName?.message}
                >
                  <TextInput placeholder="Alex" {...form.register("firstName")} />
                </Field>
                <Field
                  label="Last name"
                  error={form.formState.errors.lastName?.message}
                >
                  <TextInput
                    placeholder="Morgan"
                    {...form.register("lastName")}
                  />
                </Field>
              </div>
            ) : null}
            <Field label="Email" error={form.formState.errors.email?.message}>
              <TextInput
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
              />
            </Field>
            {mode !== "recovery" ? (
              <Field
                label="Password"
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
              {mode === "login" ? "Login" : mode === "signup" ? "Start membership" : "Send reset link"}
            </Button>
            {mode === "login" ? (
              <button
                type="button"
                className="text-left text-[10px] font-black uppercase tracking-widest underline opacity-50 hover:opacity-100"
                onClick={() => setMode("recovery")}
              >
                Forgot password?
              </button>
            ) : mode === "recovery" ? (
              <button
                type="button"
                className="text-left text-[10px] font-black uppercase tracking-widest underline opacity-50 hover:opacity-100"
                onClick={() => setMode("login")}
              >
                Back to login
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
  return (
    <Card interactive className="group flex h-full flex-col overflow-hidden">
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
              Credits
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={event.saved ? "active" : "outline"}
              size="icon-sm"
              aria-label={event.saved ? "Saved" : "Save"}
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

function PublicDiscover({ setView }: { setView: (view: View) => void }) {
  const live = useLiveData();

  return (
    <div className="space-y-10 py-8">
      <Panel
        tone="white"
        className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end"
      >
        <div>
          <Badge tone="yellow">What's included</Badge>
          <h1 className="headline-lg mt-5">This week inside Unveiled.</h1>
          <p className="mt-4 max-w-2xl text-lg font-bold leading-relaxed">
            A public preview with stat cards, featured events, category cards,
            partner cards, and the same no-results support behavior as the
            legacy access page.
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
              Curated drops, partner capacity, and credit pricing stay visible.
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
            onOpen={() => setView("member")}
          />
        ))}
        {live.events.length === 0 ? (
          <StatePanel
            title="Nothing public yet"
            text={
              live.isLoading
                ? "Live event data is loading."
                : live.isError
                  ? "Live event data could not be loaded."
                  : "No upcoming events are available."
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
                Reset filters
              </Button>
            }
          />
        ) : null}
      </section>

      <section className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <Panel tone="dark">
          <p className="unveiled-meta opacity-60">Missing venue</p>
          <p className="headline-md mt-4">Want a partner added?</p>
          <Button type="button" variant="yellow" className="mt-6">
            Tell support
            <Mail />
          </Button>
        </Panel>
        <Panel tone="white">
          <p className="unveiled-meta opacity-60">Active partners</p>
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
  );
}

function HowItWorks() {
  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">How it works</Badge>
        <h1 className="headline-lg mt-5 max-w-4xl">
          Credits become cultural access.
        </h1>
      </Panel>
      <div className="grid gap-5 md:grid-cols-3">
        {["Pick a moment", "Spend credits", "Redeem at venue"].map(
          (title, index) => (
            <Card key={title} className="p-6">
              <p className="font-display text-7xl font-black leading-none">
                0{index + 1}
              </p>
              <h2 className="mt-5 font-display text-3xl font-black uppercase leading-none">
                {title}
              </h2>
              <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-60">
                Step cards keep the same compact label hierarchy and thick
                border rhythm.
              </p>
            </Card>
          ),
        )}
      </div>
      <Panel
        tone="dark"
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"
      >
        <p className="headline-md">Membership, not a public marketplace.</p>
        <Badge tone="yellow">10 credits monthly</Badge>
      </Panel>
    </div>
  );
}

function FaqPage({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="space-y-8 py-8">
      <Button type="button" variant="ghost" onClick={() => setView("landing")}>
        <ArrowLeft />
        Back
      </Button>
      <Panel tone="white">
        <Badge tone="yellow">FAQ</Badge>
        <h1 className="headline-lg mt-5">Questions before access?</h1>
      </Panel>
      <div className="grid gap-4">
        {[
          "How do credits work?",
          "Can I cancel membership?",
          "Where do redemption codes appear?",
          "What if an event is full?",
        ].map((question, index) => (
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
              Answers render as bordered accordion rows with direct support
              access at support@unveiled.berlin.
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

function OnboardingPage() {
  const live = useLiveData();
  const [message, setMessage] = useState(
    "Choose a few preferences to personalize your feed.",
  );
  const [submitting, setSubmitting] = useState(false);

  async function submit(onboardingComplete: boolean) {
    setSubmitting(true);
    await runServerAction(
      () =>
        actions.saveOnboarding({
          ageGroup: "26-35",
          interests: ["Theater", "Kino"],
          moods: ["Leicht"],
          districts: ["Mitte"],
          maxDistance: 10,
          timing: ["After Work"],
          preferredDays: ["Fr", "Sa"],
          preferredLanguages: ["DE"],
          accessibility: false,
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

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel tone="white" className="space-y-6">
        <Badge tone="yellow">Onboarding</Badge>
        <h1 className="headline-lg">Make the feed yours.</h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-55">
          {message}
        </p>
      </Panel>
      <Panel tone="dark" className="space-y-6">
        <p className="unveiled-meta opacity-55">Preference preview</p>
        <div className="flex flex-wrap gap-2">
          {["Theater", "Kino", "Mitte", "After Work", "Fr", "Sa"].map(
            (value) => (
              <Badge key={value} tone="yellow">
                <Heart className="size-3" />
                {value}
              </Badge>
            ),
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="yellow"
            loading={submitting}
            onClick={() => void submit(true)}
          >
            Save preferences
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => void submit(true)}
          >
            Skip for now
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function MembershipPage() {
  const live = useLiveData();
  const [message, setMessage] = useState(
    "Choose a payment method to start checkout.",
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "EXPRESS" | "PAYPAL" | "CARD" | "SEPA" | undefined
  >();

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel tone="white" className="space-y-6">
        <Badge tone="yellow">Membership</Badge>
        <div>
          <h1 className="headline-lg">Basic Berlin</h1>
          <p className="mt-3 text-4xl font-black">29€/mo</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            Monthly credits, verified partner access, and member-only event
            drops.
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
          {[
            "Curated Berlin culture access",
            "Credits refreshed monthly",
            "Password and voucher redemption",
            "Support at support@unveiled.berlin",
          ].map((perk) => (
            <Badge key={perk} tone="white" className="justify-start">
              <Check className="size-3" />
              {perk}
            </Badge>
          ))}
        </div>
      </Panel>

      <Panel tone="cream" className="space-y-5">
        <div>
          <p className="unveiled-meta">Payment method</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-55">
            Sign in before provider checkout initializes. No payment method is
            preselected.
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
        <Field label="Promo code">
          <TextInput name="promoCode" placeholder="Optional" />
        </Field>
        <Button
          type="button"
          className="w-full"
          onClick={() =>
            void runServerAction(
              () =>
                actions.updateMembership({
                  paymentMethod: selectedPaymentMethod,
                  promoCode: "",
                  isFrozen: false,
                  isActive:
                    live.billingDisplay.subscriptionStatusLabel === "Active",
                }),
              setMessage,
              live.refetchActiveSurface,
            )
          }
        >
          Continue to checkout
        </Button>
        <p className="text-xs font-bold uppercase tracking-widest opacity-55">
          {message}
        </p>
      </Panel>
    </div>
  );
}

function DiscoveryFilterPanel() {
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
      <Field label="Start date">
        <TextInput
          type="date"
          value={filters.startDate ?? ""}
          onChange={(event) => updateFilter({ startDate: event.target.value })}
        />
      </Field>
      <Field label="End date">
        <TextInput
          type="date"
          value={filters.endDate ?? ""}
          onChange={(event) => updateFilter({ endDate: event.target.value })}
        />
      </Field>
      <Field label="Category">
        <SelectInput
          value={filters.category ?? ""}
          onChange={(event) => updateFilter({ category: event.target.value })}
        >
          <option value="">All categories</option>
          {live.publicCategories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Partner">
        <SelectInput
          value={filters.partnerId ?? ""}
          onChange={(event) => updateFilter({ partnerId: event.target.value })}
        >
          <option value="">All partners</option>
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
  const live = useLiveData();
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
                ? "Waitlist success"
                : "Booking success"}
            </h2>
            <div className="grid gap-6 text-left md:grid-cols-2">
              {result?.state === "confirmed" ? (
                <Panel tone={event.ticketType === "Voucher" ? "dark" : "white"}>
                  <p className="unveiled-meta opacity-55">
                    {event.ticketType === "Voucher"
                      ? "Ticket code"
                      : "Password to enter"}
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
                    {copied ? "Copied" : "Copy code"}
                  </Button>
                </Panel>
              ) : (
                <Panel tone="white">
                  <p className="unveiled-meta opacity-55">Waitlist</p>
                  <p className="headline-md mt-5">You're on the list</p>
                  <p className="mt-4 text-sm font-bold opacity-70">
                    No credits were debited and capacity was not changed.
                  </p>
                </Panel>
              )}
              <Panel
                tone="dark"
                className="flex flex-col justify-between gap-8"
              >
                <div>
                  <p className="unveiled-meta opacity-55">Save the date</p>
                  <p className="headline-md mt-5">Mark the moment</p>
                </div>
                <Button type="button" variant="yellow">
                  <Calendar />
                  Sync to life
                </Button>
              </Panel>
            </div>
            <Button type="button" variant="link" onClick={onClose}>
              Return to feed
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
            <div className="border-t-2 border-brand-dark/15 pt-6">
              <p className="unveiled-meta opacity-45">Location</p>
              <p className="mt-2 text-2xl font-black uppercase tracking-tight">
                {event.address}
              </p>
            </div>
            <Panel tone="cream" shadow={false} className="p-4">
              <p className="unveiled-meta">Gate copy</p>
              <p className="mt-2 text-sm font-bold">
                Active membership required. Password and voucher redemption
                states are rendered after booking.
              </p>
              {result?.state === "failure" ? (
                <p className="mt-4 border-t-2 border-brand-dark/20 pt-4 text-sm font-black uppercase text-red-700">
                  {result.message}
                  {result.waitlistAvailable
                    ? " Join the waitlist instead."
                    : ""}
                </p>
              ) : null}
            </Panel>
          </section>

          <Panel tone="dark" className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <span className="unveiled-meta">Tickets</span>
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
              <span className="unveiled-meta opacity-55">Total</span>
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
                if (membershipBlocked) {
                  setResult({
                    state: "failure",
                    message:
                      event.membershipCta ??
                      "An active membership is required.",
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
                    message: "The request could not be completed.",
                  });
                  return;
                }

                if (!response.data.ok) {
                  setResult({
                    state: "failure",
                    message:
                      response.data.formError ??
                      "Check the highlighted fields.",
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
                "Join waitlist"
              ) : (
                "Confirm access"
              )}
              <ArrowRight />
            </Button>
          </Panel>
        </>
      )}
    </ModalShell>
  );
}

function MemberFeed() {
  const live = useLiveData();
  const [selected, setSelected] = useState<EventCardView | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const visible = useMemo(() => live.events, [live.events]);
  const discovery = {
    ...demoDiscoveryShell,
    filtersOpen,
    mapOpen,
    visibleResultCount: visible.length,
    resultCountLabel: live.visibleEventCountLabel,
    activeRangeLabel: live.activeRangeLabel,
    activeFilterCount: live.activeFilterCount,
  };
  const gateBlocked = visible.some(
    (event) => event.bookingAvailabilityState === "frozen",
  );
  const [feedMessage, setFeedMessage] = useState("");

  return (
    <div className="space-y-6">
      <Panel tone="white">
        <Badge tone="yellow">Member feed</Badge>
        <h1 className="headline-lg mt-5">Today in Berlin.</h1>
      </Panel>
      {gateBlocked ? (
        <Panel tone="cream" shadow={false} className="p-4">
          <p className="unveiled-meta">Membership gate</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest">
            Update billing to book or join waitlists.
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
          <Panel tone="cream" shadow={false} className="min-h-72 p-0">
            <div className="grid h-full min-h-72 place-items-center border-[12px] border-brand-cream bg-[linear-gradient(135deg,#feffe2_25%,#f5f5f5_25%,#f5f5f5_50%,#feffe2_50%,#feffe2_75%,#f5f5f5_75%)] bg-[length:36px_36px]">
              <div className="border-4 border-brand-dark bg-white p-5 text-center unveiled-shadow">
                <MapPin className="mx-auto mb-3 size-8" />
                <p className="unveiled-meta">Map markers</p>
                <p className="mt-2 text-sm font-bold">
                  {visible.map((event) => event.mapLabel).join(" // ") ||
                    "No live event markers"}
                </p>
              </div>
            </div>
          </Panel>
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
        }}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {visible.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpen={setSelected}
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
              title={live.isLoading ? "Loading events" : "No matching events"}
              text={
                live.isError
                  ? "Live event data could not be loaded."
                  : "No live events match the current filters."
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
                  Reset all
                </Button>
              }
            />
          ) : null}
        </div>
      </DiscoveryShell>
      {selected ? (
        <BookingModal event={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function BookingsPage() {
  const live = useLiveData();

  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">My bookings</Badge>
        <h1 className="headline-lg mt-5">Your access codes.</h1>
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
              <Badge tone="white">{booking.ticketCount} tickets</Badge>
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
                  {booking.totalCredits} credits spent
                </p>
              </div>
              <Button
                type="button"
                variant={booking.copied ? "copied" : "secondary"}
              >
                {booking.copied ? <Check /> : <Copy />}
                {booking.copied ? "Copied" : "Copy code"}
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
        <Badge tone="yellow">Credit ledger</Badge>
        <div className="mt-5 space-y-3">
          {live.creditLedgerEntries.map((entry) => (
            <TableRow key={entry.id}>
              <span className="font-black uppercase">
                {entry.reasonLabel}
                {entry.relatedLabel ? ` // ${entry.relatedLabel}` : ""}
              </span>
              <span>{entry.createdLabel}</span>
              <span>
                {entry.actorLabel ? `Actor: ${entry.actorLabel}` : "Member"}
              </span>
              <span className="font-black">
                {entry.amount > 0 ? "+" : ""}
                {entry.amount} credits
              </span>
            </TableRow>
          ))}
          {live.creditLedgerEntries.length === 0 ? (
            <StatePanel
              title="No credit history"
              text="Ledger entries will appear after credits are added or spent."
              state="empty"
            />
          ) : null}
        </div>
      </Panel>
      {live.bookings.length === 0 ? (
        <StatePanel
          title={live.isLoading ? "Loading bookings" : "No bookings yet"}
          text={
            live.isError
              ? "Live booking data could not be loaded."
              : "Your access codes will appear after booking."
          }
          state={live.isLoading ? "loading" : live.isError ? "error" : "empty"}
          action={
            <Button type="button" variant="primary">
              Browse events
            </Button>
          }
        />
      ) : null}
      <Panel
        tone="dark"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <span className="unveiled-meta opacity-60">
          Questions about your ticket?
        </span>
        <Button type="button" variant="yellow">
          support@unveiled.berlin
          <Mail />
        </Button>
      </Panel>
    </div>
  );
}

function ProfilePage() {
  const live = useLiveData();
  const [profileMessage, setProfileMessage] = useState(
    "Profile changes submit through server actions.",
  );
  const [membershipMessage, setMembershipMessage] = useState(
    "Choose a payment method to start Stripe subscription checkout.",
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "EXPRESS" | "PAYPAL" | "CARD" | "SEPA" | undefined
  >();
  const [preferenceMessage, setPreferenceMessage] = useState(
    "Preference and onboarding state can be saved from this panel.",
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
          label="Wallet"
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
          <p className="unveiled-meta">Identity</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {profileMessage}
          </p>
          <Field label="Name" className="mt-5">
            <TextInput name="firstName" defaultValue={live.profile.firstName} />
          </Field>
          <Field label="Last name" className="mt-4">
            <TextInput name="lastName" defaultValue={live.profile.lastName} />
          </Field>
          <Field label="Email" className="mt-4">
            <TextInput defaultValue={live.profile.email} disabled />
          </Field>
          <Field label="Billing address" className="mt-4">
            <TextInput
              name="billingAddress"
              defaultValue={live.profile.billingAddress}
              placeholder="Berlin"
            />
          </Field>
          <Field label="Language" className="mt-4">
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
            Newsletter
          </label>
          <a
            className="mt-4 block text-[10px] font-black uppercase tracking-widest underline"
            href="/api/account/password-recovery"
          >
            Password recovery
          </a>
          <Button type="submit" className="mt-5" variant="secondary">
            Save profile
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
          <p className="unveiled-meta">Billing</p>
          <p className="headline-md mt-5">{live.billingDisplay.planLabel}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {live.billingDisplay.planPriceLabel} {" // "}
            {live.profile.monthlyCredits} credits monthly
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {live.billingDisplay.subscriptionStatusLabel} {" // "}
            {live.billingDisplay.paymentMethodDisplay} {" // "}
            renews {live.billingDisplay.nextBillDateLabel}
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
              <p className="unveiled-meta opacity-55">Standard</p>
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
                    Stripe card fields mount here.
                  </p>
                </Panel>
              ) : null}
              {selectedPaymentMethod === "SEPA" ? (
                <Panel tone="cream" shadow={false} className="mt-3 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                    Stripe SEPA mandate and IBAN controls mount here.
                  </p>
                </Panel>
              ) : null}
            </div>
          </div>
          <Field label="Promo code" className="mt-4">
            <TextInput name="promoCode" placeholder="Optional" />
          </Field>
          <Button type="submit" variant="secondary" className="mt-6">
            <CreditCard />
            Start checkout
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
          <p className="unveiled-meta opacity-55">Vibes</p>
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
              <Badge tone="white">No preferences yet</Badge>
            ) : null}
          </div>
          <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
            <Loader2 className="size-4 animate-spin" />
            Loading preference preview
          </div>
          <Button type="submit" variant="yellow" className="mt-6">
            Save onboarding
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
              <Button type="button" variant="copied" className="mt-4">
                <Check />
                {live.partner.venueQrUrl}
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
              () => actions.getPartnerBookingExportRows({}),
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
        <Button type="button" variant="yellow">
          New event
          <Plus />
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            void runServerAction(
              () => actions.getAdminExportRows({}),
              setAdminMessage,
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
                setAdminMessage(
                  downloaded ? "CSV export downloaded." : "No export rows.",
                );
              },
            )
          }
        >
          Partner export
          <ArrowDownToLine />
        </Button>
        <Field label="Export partner" className="min-w-64 text-brand-yellow">
          <SelectInput>
            <option>All partners</option>
            {live.adminPartners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </SelectInput>
        </Field>
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
          tone="white"
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
                actions.saveEvent({
                  partnerId: String(
                    formData.get("partnerId") ||
                      live.adminPartners[0]?.id ||
                      "",
                  ),
                  title: String(formData.get("title") || ""),
                  description: String(formData.get("description") || ""),
                  category: "Theater",
                  eventType: "Drop",
                  dateTime: `${String(formData.get("date") || "2026-05-04")}T${String(formData.get("time") || "19:00")}:00.000Z`,
                  timingMode: "TIME_SLOT",
                  startTimeMinutes: 19 * 60,
                  weekday: 1,
                  address: "Berlin",
                  neighborhood: "Mitte",
                  imageUrl: "",
                  tags: [],
                  creditPrice: Number(formData.get("credits") || 0),
                  totalCapacity: Number(formData.get("capacity") || 1),
                  ticketType: "SECRET_CODE",
                  secretCodeMode: "MANUAL",
                  secretCode: "UNVEILED",
                  barrierFree: false,
                  languages: ["DE"],
                  targetAgeGroups: ["26-35"],
                  series: {
                    enabled: true,
                    count: 3,
                    intervalDays: 7,
                  },
                }),
              setAdminMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="headline-md">Event form</p>
          <p className="text-xs font-bold uppercase tracking-widest opacity-55">
            {adminMessage}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={formContracts.event.visibleMessages[0]}>
              <TextInput name="title" placeholder="Event title" />
            </Field>
            <Field label="Partner">
              <SelectInput name="partnerId">
                {live.adminPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Date">
              <TextInput name="date" type="date" defaultValue="2026-05-04" />
            </Field>
            <Field label="Time">
              <TextInput name="time" type="time" defaultValue="19:00" />
            </Field>
            <Field label="Credits">
              <TextInput name="credits" type="number" defaultValue={2} />
            </Field>
            <Field
              label="Capacity"
              error={formContracts.event.visibleMessages[1]}
            >
              <TextInput name="capacity" type="number" defaultValue={1} />
            </Field>
          </div>
          <Field label="Optional info">
            <TextArea
              name="description"
              placeholder="Door notes, redemption details, image alt text"
            />
          </Field>
          <Panel tone="cream" shadow={false} className="p-4">
            <p className="unveiled-meta">Image preview</p>
            <div className="mt-3 h-36 border-4 border-brand-dark bg-brand-grey" />
          </Panel>
          <Button type="submit">Publish event</Button>
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
          className="space-y-4"
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(
              event.currentTarget as HTMLFormElement,
            );
            void runServerAction(
              () =>
                actions.savePartner({
                  name: String(formData.get("name") || ""),
                  contactEmail: String(formData.get("contactEmail") || ""),
                  address: String(formData.get("address") || "Berlin"),
                  logoUrl: "",
                }),
              setAdminMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="headline-md">Partners</p>
          <Field
            label="Venue name"
            error={formContracts.partner.visibleMessages[0]}
          >
            <TextInput name="name" placeholder="Venue name" />
          </Field>
          <Field label="Contact email">
            <TextInput name="contactEmail" placeholder="partner@example.com" />
          </Field>
          <Field label="Address">
            <TextInput name="address" placeholder="Berlin" />
          </Field>
          <Panel tone="cream" shadow={false} className="p-4">
            <p className="unveiled-meta">Logo preview</p>
            <ShellLogo className="mt-4" />
          </Panel>
          <div className="flex flex-wrap gap-2">
            {live.adminPartners.map((partner) => (
              <div
                key={partner.id}
                className="flex flex-wrap items-center gap-2 border-b-2 border-brand-dark/20 pb-2"
              >
                <Badge tone="white">
                  {partner.name}
                  {" // "}
                  {partner.portalLoginLabel}
                  {" // "}
                  {partner.venueQrTokenLabel}
                </Badge>
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
            ))}
            <Button type="submit" variant="primary">
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
                <div>
                  <p className="text-sm font-black uppercase tracking-widest">
                    {member.fullName}
                  </p>
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

  const publicQuery = usePublicDiscoveryQuery(publicInitial?.filters, {
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
    initialDiscovery?.surface === "member"
      ? (initialDiscovery.filters ?? {})
      : {},
  );
  const live = useLiveDataView(
    initialDiscovery,
    discoveryFilters,
    setDiscoveryFilters,
  );
  const [view, setView] = useState<View>(initialView);
  const demoShell = createDemoShellViewModel(view, {
    savedCount: live.savedCount,
    creditCount: live.profile.credits,
  });
  const shell = initialShell
    ? {
        ...initialShell,
        language: {
          ...initialShell.language,
          selected: live.profile.language ?? initialShell.language.selected,
        },
        savedCount: live.savedCount,
        creditCount:
          initialShell.viewerContext === "member"
            ? live.profile.credits
            : initialShell.creditCount,
        navItems: initialShell.navItems.map((item) =>
          item.itemId === "saved" ? { ...item, count: live.savedCount } : item,
        ),
      }
    : demoShell;
  const pageShell =
    view === "member"
      ? demoPageShells.member
      : view === "partner"
        ? demoPageShells.partner
        : view === "admin"
          ? demoPageShells.admin
          : view === "discover"
            ? demoPageShells.public
            : undefined;
  const navigateShell = async (actionId: string) => {
    if (actionId.startsWith("language:")) {
      const language = actionId.slice("language:".length);
      if (language === "DE" || language === "EN") {
        await actions.updateProfile({
          firstName: live.profile.firstName,
          lastName: live.profile.lastName,
          language,
          billingAddress: live.profile.billingAddress,
          newsletterOptIn: live.profile.newsletterOptIn,
        });
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
          {view === "landing" ? <LandingPage setView={setView} callbackURL={callbackURL} /> : null}
          {view === "discover" ? <PublicDiscover setView={setView} /> : null}
          {view === "how" ? <HowItWorks /> : null}
          {view === "onboarding" ? <OnboardingPage /> : null}
          {view === "membership" ? <MembershipPage /> : null}
          {view === "faq" ? <FaqPage setView={setView} /> : null}
          {view === "member" ? <MemberFeed /> : null}
          {view === "bookings" ? <BookingsPage /> : null}
          {view === "profile" ? <ProfilePage /> : null}
          {view === "partner" ? <PartnerPortal /> : null}
          {view === "admin" ? <AdminPanel /> : null}
        </PageShell>
      </AppShell>
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
