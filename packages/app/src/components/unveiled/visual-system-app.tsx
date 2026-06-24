import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  Button,
  Field,
  Panel,
  StatePanel,
  TextInput,
} from "@unveiled/design-system";
import { cn } from "@unveiled/design-system/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { useContext, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { HeroUIProvider } from "~/components/providers/heroui-provider";
import { QueryProvider } from "~/components/providers/query-provider";
import { AppShell, PageShell } from "~/components/unveiled/app-shell";
import {
  type AppShellViewModel,
  shellDemoViews,
} from "~/lib/app-shell-view-models";
import { isInitialSurfaceData } from "~/lib/data-access/surface-data";
import {
  actionSuccess,
  formFailure,
  translateMessage,
} from "~/lib/forms/action-result";
import { applyFormActionResult } from "~/lib/forms/client-action";
import {
  loginSchema,
  passwordRecoverySchema,
  signupSchema,
} from "~/lib/forms/schemas";
import { formContracts } from "~/lib/unveiled-view-models";
import { AdminPanel } from "./AdminPanel";
// Custom context imports
import {
  type AuthEndpointResult,
  type AuthLandingValues,
  LanguageContext,
  useCopy,
  useVisualSystem,
  type View,
  VisualSystemProvider,
} from "./context";
import {
  BookingsPage,
  MemberFeed,
  MembershipPage,
  OnboardingPage,
  ProfilePage,
} from "./MemberFeed";
import { PartnerPortal } from "./PartnerPortal";
// Modularized components
import { FaqPage, HowItWorks, PublicDiscover } from "./PublicDiscover";

function LandingPage({
  callbackURL = "/",
  initialMode = "login",
}: {
  callbackURL?: string;
  initialMode?: "login" | "signup" | "recovery";
}) {
  const selectedLanguage = useContext(LanguageContext);
  const allCopy = useCopy();
  const copy = allCopy.public;
  const deepLinkCopy = allCopy.routing.deepLink;
  const safeCallbackTarget = (() => {
    const trimmed = callbackURL.trim();
    if (
      !trimmed ||
      trimmed === "/" ||
      trimmed === `/${selectedLanguage.toLowerCase()}` ||
      trimmed === `/${selectedLanguage.toLowerCase()}/`
    ) {
      return null;
    }
    return trimmed;
  })();
  const [mode, setMode] = useState<"login" | "signup" | "recovery">(
    initialMode,
  );
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
              message: translateMessage(
                payload.state?.message ?? copy.auth.done,
                selectedLanguage,
              ),
            },
          })
        : formFailure(
            payload?.state?.message ?? copy.auth.failed,
            selectedLanguage,
          );

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
        let nextPath = actionResult.data.nextPath;
        if (
          nextPath.startsWith("/") &&
          !nextPath.startsWith("/de/") &&
          !nextPath.startsWith("/en/") &&
          nextPath !== "/de" &&
          nextPath !== "/en"
        ) {
          nextPath = `/${selectedLanguage.toLowerCase()}${nextPath}`;
        }
        window.location.assign(nextPath);
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
          <a
            href={`/app/${selectedLanguage.toLowerCase()}/discover`}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-yellow hover:shadow-[4px_4px_0_0_#202621] focus-visible:ring-4 focus-visible:ring-brand-dark/25"
          >
            {copy.exploreAccess}
            <ArrowRight />
          </a>
          <a
            href={`/app/${selectedLanguage.toLowerCase()}/how-it-works`}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-yellow hover:shadow-[4px_4px_0_0_#202621] focus-visible:ring-4 focus-visible:ring-brand-dark/25"
          >
            {copy.howItWorks}
            <ArrowRight />
          </a>
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
              ? copy.auth.welcomeBack
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
        {safeCallbackTarget ? (
          <div
            id="deep-link-preview"
            role="status"
            aria-live="polite"
            className="rounded-md border border-border bg-muted/40 p-3 text-sm"
          >
            <p>
              {deepLinkCopy.preview.replace(
                "{destination}",
                safeCallbackTarget,
              )}
            </p>
            <input
              id="deep-link-redirect-input"
              type="hidden"
              name="callbackURL"
              value={safeCallbackTarget}
              readOnly
            />
          </div>
        ) : null}
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
          <form
            className="grid gap-4"
            method="POST"
            onSubmit={form.handleSubmit(submitAuth)}
          >
            {mode === "signup" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={copy.auth.firstName}
                  error={
                    form.formState.errors.firstName?.message &&
                    translateMessage(
                      form.formState.errors.firstName.message,
                      selectedLanguage,
                    )
                  }
                >
                  <TextInput
                    placeholder="Alex"
                    {...form.register("firstName")}
                  />
                </Field>
                <Field
                  label={copy.auth.lastName}
                  error={
                    form.formState.errors.lastName?.message &&
                    translateMessage(
                      form.formState.errors.lastName.message,
                      selectedLanguage,
                    )
                  }
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
              error={
                form.formState.errors.email?.message &&
                translateMessage(
                  form.formState.errors.email.message,
                  selectedLanguage,
                )
              }
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
                error={
                  form.formState.errors.password?.message &&
                  translateMessage(
                    form.formState.errors.password.message,
                    selectedLanguage,
                  )
                }
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
                ? copy.auth.login
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

function VisualSystemAppContent({
  hasInitialShell = false,
  initialMode = "login",
}: {
  hasInitialShell?: boolean;
  initialMode?: "login" | "signup" | "recovery";
}) {
  const {
    view,
    setView,
    selectedEvent,
    handleOpenEvent,
    bookingEvent,
    setBookingEvent,
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
    shell,
    pageShell,
    navigateShell,
    callbackURL,
    initialTab,
  } = useVisualSystem();

  return (
    <AppShell shell={shell} onAction={navigateShell}>
      <div className="pt-6">
        {!hasInitialShell ? (
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
          <LandingPage callbackURL={callbackURL} initialMode={initialMode} />
        ) : null}
        {view === "discover" ? <PublicDiscover /> : null}
        {view === "how" ? <HowItWorks /> : null}
        {view === "onboarding" ? <OnboardingPage /> : null}
        {view === "membership" ? <MembershipPage /> : null}
        {view === "faq" ? <FaqPage /> : null}
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
        {view === "admin" ? (
          <AdminPanel
            initialTab={initialTab}
            membersPage={membersPage}
            setMembersPage={setMembersPage}
            membersPageSize={membersPageSize}
            setMembersPageSize={setMembersPageSize}
            partnersPage={partnersPage}
            setPartnersPage={setPartnersPage}
            partnersPageSize={partnersPageSize}
            setPartnersPageSize={setPartnersPageSize}
            eventsPage={eventsPage}
            setEventsPage={setEventsPage}
            eventsPageSize={eventsPageSize}
            setEventsPageSize={setEventsPageSize}
          />
        ) : null}
      </PageShell>
    </AppShell>
  );
}

export function VisualSystemApp({
  initialShell,
  initialDiscovery,
  initialView = "landing",
  callbackURL = "/",
  initialTab = "metrics",
  initialMode = "login",
}: {
  initialShell?: AppShellViewModel;
  initialDiscovery?: unknown;
  initialView?: View;
  callbackURL?: string;
  initialTab?: string;
  initialMode?: "login" | "signup" | "recovery";
}) {
  const initialSurface = isInitialSurfaceData(initialDiscovery)
    ? initialDiscovery
    : undefined;

  return (
    <HeroUIProvider>
      <QueryProvider>
        <VisualSystemProvider
          initialShell={initialShell}
          initialDiscovery={initialSurface}
          initialView={initialView}
          callbackURL={callbackURL}
          initialTab={initialTab}
        >
          <VisualSystemAppContent
            hasInitialShell={Boolean(initialShell)}
            initialMode={initialMode}
          />
        </VisualSystemProvider>
      </QueryProvider>
    </HeroUIProvider>
  );
}
