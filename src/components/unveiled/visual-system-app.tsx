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
import { useMemo, useState } from "react";

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
  createDemoShellViewModel,
  demoDiscoveryShell,
  demoModalShell,
  demoPageShells,
  demoShellStates,
  type ShellNavItemId,
  shellDemoViews,
} from "@/lib/app-shell-view-models";
import {
  adminEvents,
  bookings,
  derivedValues,
  type EventCardView,
  events,
  formContracts,
  partnerGuests,
  profile,
} from "@/lib/unveiled-view-models";
import { cn } from "@/lib/utils";

type View = Extract<
  ShellNavItemId,
  | "landing"
  | "discover"
  | "how"
  | "faq"
  | "member"
  | "bookings"
  | "profile"
  | "partner"
  | "admin"
>;

function LandingPage({ setView }: { setView: (view: View) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");

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
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={cn(
              "flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest",
              mode === "signup" && "bg-brand-dark text-white",
            )}
            onClick={() => setMode("signup")}
            type="button"
          >
            Register
          </button>
        </div>
        <div>
          <p className="headline-md">
            {mode === "login" ? "Welcome back" : "Create access"}
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-55">
            Visible validation and notice panels match the legacy auth surface.
          </p>
        </div>
        <Panel tone="cream" shadow={false} className="p-4">
          <p className="unveiled-meta">Notice</p>
          <p className="text-sm font-bold">
            Use your member email to continue.
          </p>
        </Panel>
        <div className="grid gap-4">
          {mode === "signup" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                error={formContracts.landing.visibleMessages[2]}
              >
                <TextInput placeholder="Alex" />
              </Field>
              <Field label="Last name">
                <TextInput placeholder="Morgan" />
              </Field>
            </div>
          ) : null}
          <Field label="Email" error={formContracts.landing.visibleMessages[0]}>
            <TextInput type="email" placeholder="you@example.com" />
          </Field>
          <Field
            label="Password"
            helper={formContracts.landing.visibleMessages[1]}
          >
            <TextInput type="password" placeholder="••••••••" />
          </Field>
        </div>
        <Button type="button" className="w-full" loading={mode === "signup"}>
          {mode === "login" ? "Login" : "Start membership"}
        </Button>
      </Panel>
    </div>
  );
}

function EventCard({
  event,
  compact = false,
  onOpen,
}: {
  event: EventCardView;
  compact?: boolean;
  onOpen: (event: EventCardView) => void;
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
          src={event.imageUrl}
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
          {derivedValues.publicStats.map((stat) => (
            <StatPanel key={stat.label} {...stat} />
          ))}
        </div>
      </Panel>

      <section className="grid gap-5 md:grid-cols-3">
        {["Art", "Music", "Food"].map((category) => (
          <Card key={category} interactive className="bg-brand-cream p-6">
            <p className="headline-md">{category}</p>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-60">
              Curated drops, partner capacity, and credit pricing stay visible.
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            compact
            onOpen={() => setView("member")}
          />
        ))}
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
        <StatePanel
          title="Nothing public yet"
          text="When filters hide all featured events, the empty state remains bordered and direct."
          action={
            <Button type="button" variant="secondary">
              Reset filters
            </Button>
          }
        />
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

function DiscoveryFilters() {
  return (
    <Panel
      tone="white"
      shadow={false}
      className="grid gap-4 p-4 md:grid-cols-4"
    >
      <Field label="Start date">
        <TextInput type="date" />
      </Field>
      <Field label="End date">
        <TextInput type="date" />
      </Field>
      <Field label="Category">
        <SelectInput defaultValue="">
          <option value="">All categories</option>
          <option>Art</option>
          <option>Music</option>
          <option>Food</option>
        </SelectInput>
      </Field>
      <Field label="Partner">
        <SelectInput defaultValue="">
          <option value="">All partners</option>
          <option>Kunsthalle Mitte</option>
          <option>Studio Lobe</option>
          <option>Table 17</option>
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
  const [count, setCount] = useState(1);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const total = count * event.creditPrice;

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
              {event.remainingCapacity === 0
                ? "Waitlist success"
                : "Booking success"}
            </h2>
            <div className="grid gap-6 text-left md:grid-cols-2">
              <Panel tone={event.ticketType === "Voucher" ? "dark" : "white"}>
                <p className="unveiled-meta opacity-55">
                  {event.ticketType === "Voucher"
                    ? "Ticket code"
                    : "Password to enter"}
                </p>
                <p className="mt-6 break-all font-display text-5xl font-black uppercase">
                  {event.ticketType === "Voucher" ? "UNV-BER-25" : "UNVEILED"}
                </p>
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
              onClick={() => setSuccess(true)}
            >
              {event.remainingCapacity === 0
                ? "Join waitlist"
                : "Confirm access"}
              <ArrowRight />
            </Button>
          </Panel>
        </>
      )}
    </ModalShell>
  );
}

function MemberFeed() {
  const [selected, setSelected] = useState<EventCardView | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const visible = useMemo(() => events, []);
  const discovery = {
    ...demoDiscoveryShell,
    filtersOpen,
    mapOpen,
    visibleResultCount: visible.length,
    resultCountLabel: derivedValues.visibleEventCount,
    activeRangeLabel: derivedValues.activeRangeLabel,
  };

  return (
    <div className="space-y-6">
      <Panel tone="white">
        <Badge tone="yellow">Member feed</Badge>
        <h1 className="headline-lg mt-5">Today in Berlin.</h1>
      </Panel>
      <DiscoveryShell
        discovery={discovery}
        filterPanel={<DiscoveryFilters />}
        mapPanel={
          <Panel tone="cream" shadow={false} className="min-h-72 p-0">
            <div className="grid h-full min-h-72 place-items-center border-[12px] border-brand-cream bg-[linear-gradient(135deg,#feffe2_25%,#f5f5f5_25%,#f5f5f5_50%,#feffe2_50%,#feffe2_75%,#f5f5f5_75%)] bg-[length:36px_36px]">
              <div className="border-4 border-brand-dark bg-white p-5 text-center unveiled-shadow">
                <MapPin className="mx-auto mb-3 size-8" />
                <p className="unveiled-meta">Map markers</p>
                <p className="mt-2 text-sm font-bold">
                  {events.map((event) => event.mapLabel).join(" // ")}
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
            <EventCard key={event.id} event={event} onOpen={setSelected} />
          ))}
        </div>
      </DiscoveryShell>
      <StatePanel
        title={demoShellStates.empty.title}
        text={demoShellStates.empty.message}
        action={
          <Button type="button" variant="secondary">
            Reset all
          </Button>
        }
      />
      {selected ? (
        <BookingModal event={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function BookingsPage() {
  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">My bookings</Badge>
        <h1 className="headline-lg mt-5">Your access codes.</h1>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        {bookings.map((booking) => (
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
                <p className="font-display text-3xl font-black uppercase">
                  {booking.redemptionCode}
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
      <StatePanel
        title="No bookings yet"
        text="The empty booking state keeps support close and uses the same bordered panel."
        action={
          <Button type="button" variant="primary">
            Browse events
          </Button>
        }
      />
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
  return (
    <div className="space-y-8 py-8">
      <Panel
        tone="white"
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <Badge tone="success">{profile.membershipStatus}</Badge>
          <h1 className="headline-lg mt-5">{profile.name}</h1>
          <p className="mt-2 text-sm font-black uppercase tracking-widest opacity-55">
            {profile.email}
          </p>
        </div>
        <StatPanel
          label="Wallet"
          value={`${profile.credits}`}
          caption={derivedValues.totalCreditsLabel}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel tone="cream" shadow={false}>
          <p className="unveiled-meta">Identity</p>
          <Field label="Name" className="mt-5">
            <TextInput defaultValue={profile.name} />
          </Field>
          <Field label="Email" className="mt-4">
            <TextInput defaultValue={profile.email} disabled />
          </Field>
        </Panel>
        <Panel tone="white" shadow={false}>
          <p className="unveiled-meta">Billing</p>
          <p className="headline-md mt-5">{profile.monthlyCredits} credits</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {profile.billingLabel}
          </p>
          <Button type="button" variant="secondary" className="mt-6">
            <CreditCard />
            Manage billing
          </Button>
        </Panel>
        <Panel tone="dark" shadow={false}>
          <p className="unveiled-meta opacity-55">Vibes</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.vibes.map((vibe) => (
              <Badge key={vibe} tone="yellow">
                <Heart className="size-3" />
                {vibe}
              </Badge>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
            <Loader2 className="size-4 animate-spin" />
            Loading preference preview
          </div>
        </Panel>
      </div>
    </div>
  );
}

function PartnerPortal() {
  return (
    <div className="space-y-8 py-8">
      <Panel
        tone="white"
        className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end"
      >
        <div>
          <Badge tone="yellow">Partner portal</Badge>
          <h1 className="headline-lg mt-5">Kunsthalle Mitte.</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatPanel
            label="Total guests"
            value={derivedValues.guestTotal.replace(" guests", "")}
            caption="Across selected event"
          />
          <Panel tone="cream" shadow={false} className="p-5">
            <QrCode className="size-8" />
            <p className="mt-4 unveiled-meta">Venue QR</p>
            <Button type="button" variant="copied" className="mt-4">
              <Check />
              Copied
            </Button>
          </Panel>
        </div>
      </Panel>
      <Panel
        tone="white"
        shadow={false}
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <Field label="Search guests">
          <TextInput placeholder="Name or email" />
        </Field>
        <Field label="Event">
          <SelectInput defaultValue="Neon Gallery After Hours">
            <option>Neon Gallery After Hours</option>
            <option>Chef Counter Preview</option>
          </SelectInput>
        </Field>
        <Button type="button" className="self-end" variant="secondary">
          <Download />
          Download CSV
        </Button>
      </Panel>
      <TableShell>
        {partnerGuests.map((guest) => (
          <TableRow key={guest.email}>
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
              disabled={guest.checkedInLabel === "Disabled"}
            >
              {guest.checkedInLabel}
            </Button>
          </TableRow>
        ))}
      </TableShell>
      <StatePanel
        title="No guests"
        text="Search and event filters can render an empty guest list state."
      />
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">Admin</Badge>
        <h1 className="headline-lg mt-5">Operations overview.</h1>
      </Panel>
      <div className="grid gap-4 md:grid-cols-3">
        {derivedValues.dashboardMetrics.map((metric) => (
          <StatPanel key={metric.label} {...metric} />
        ))}
      </div>
      <Panel tone="dark" className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="yellow">
          New event
          <Plus />
        </Button>
        <Button type="button" variant="secondary">
          Partner export
          <ArrowDownToLine />
        </Button>
        <Field label="Export partner" className="min-w-64 text-brand-yellow">
          <SelectInput>
            <option>All partners</option>
            <option>Kunsthalle Mitte</option>
          </SelectInput>
        </Field>
      </Panel>
      <TableShell>
        {adminEvents.map((event) => (
          <TableRow key={event.title}>
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
            <Badge tone={event.statusLabel === "Draft" ? "grey" : "yellow"}>
              {event.statusLabel}
            </Badge>
          </TableRow>
        ))}
      </TableShell>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel tone="white" shadow={false} className="space-y-4">
          <p className="headline-md">Event form</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={formContracts.event.visibleMessages[0]}>
              <TextInput placeholder="Event title" />
            </Field>
            <Field label="Partner">
              <SelectInput>
                <option>Kunsthalle Mitte</option>
              </SelectInput>
            </Field>
            <Field label="Date">
              <TextInput type="date" />
            </Field>
            <Field label="Time">
              <TextInput type="time" />
            </Field>
            <Field label="Credits">
              <TextInput type="number" defaultValue={2} />
            </Field>
            <Field
              label="Capacity"
              error={formContracts.event.visibleMessages[1]}
            >
              <TextInput type="number" defaultValue={0} />
            </Field>
          </div>
          <Field label="Optional info">
            <TextArea placeholder="Door notes, redemption details, image alt text" />
          </Field>
          <Panel tone="cream" shadow={false} className="p-4">
            <p className="unveiled-meta">Image preview</p>
            <div className="mt-3 h-36 border-4 border-brand-dark bg-brand-grey" />
          </Panel>
          <Button type="button">Publish event</Button>
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
        <Panel tone="white" shadow={false} className="space-y-4">
          <p className="headline-md">Partners</p>
          <Field
            label="Venue name"
            error={formContracts.partner.visibleMessages[0]}
          >
            <TextInput placeholder="Venue name" />
          </Field>
          <Field label="Contact email">
            <TextInput placeholder="partner@example.com" />
          </Field>
          <Panel tone="cream" shadow={false} className="p-4">
            <p className="unveiled-meta">Logo preview</p>
            <ShellLogo className="mt-4" />
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary">
              <ExternalLink /> Portal
            </Button>
            <Button type="button" variant="secondary">
              <QrCode /> QR
            </Button>
            <Button type="button" variant="destructive">
              Delete
            </Button>
          </div>
        </Panel>
        <Panel tone="dark" shadow={false} className="space-y-4">
          <p className="headline-md">Members</p>
          <Field label="Search members" className="text-brand-yellow">
            <TextInput placeholder="Name or email" />
          </Field>
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-widest">
                  Alex Morgan
                </p>
                <p className="text-xs font-bold opacity-55">
                  Active {" // "} 8 credits
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary">
                  + Credit
                </Button>
                <Button type="button" size="sm" variant="muted">
                  Freeze
                </Button>
              </div>
            </div>
            <Divider className="my-4" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">
              History, preferences, bookings, and adjustment controls are
              expandable.
            </p>
          </Card>
          <StatePanel
            title="Loading"
            text="Admin member loading states keep the panel shape stable."
            state="loading"
          />
        </Panel>
      </div>
    </div>
  );
}

export function VisualSystemApp() {
  const [view, setView] = useState<View>("landing");
  const savedCount = events.filter((event) => event.saved).length;
  const shell = createDemoShellViewModel(view, {
    savedCount,
    creditCount: profile.credits,
  });
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
  const navigateShell = (actionId: string) => {
    const target = shellDemoViews.find((item) => item.id === actionId);
    if (target) setView(target.id as View);
    if (actionId === "membership") setView("landing");
    if (actionId === "logo")
      setView(view === "partner" || view === "admin" ? view : "landing");
    if (actionId === "profile") setView("profile");
    if (actionId === "logout") setView("landing");
  };

  return (
    <AppShell shell={shell} onAction={navigateShell}>
      <div className="pt-6">
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
      </div>
      <PageShell page={pageShell} onAction={navigateShell}>
        {view === "landing" ? <LandingPage setView={setView} /> : null}
        {view === "discover" ? <PublicDiscover setView={setView} /> : null}
        {view === "how" ? <HowItWorks /> : null}
        {view === "faq" ? <FaqPage setView={setView} /> : null}
        {view === "member" ? <MemberFeed /> : null}
        {view === "bookings" ? <BookingsPage /> : null}
        {view === "profile" ? <ProfilePage /> : null}
        {view === "partner" ? <PartnerPortal /> : null}
        {view === "admin" ? <AdminPanel /> : null}
      </PageShell>
    </AppShell>
  );
}
