import {
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Coins,
  Filter,
  Loader2,
  Lock,
  LogOut,
  Map as MapIcon,
  Menu,
  Settings,
  Ticket,
  User,
  X,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge, Panel, StatePanel } from "@/components/ui/unveiled-primitives";
import type {
  AppShellViewModel,
  DiscoveryShellViewModel,
  ModalShellViewModel,
  PageShellViewModel,
  ShellActionView,
  ShellIconName,
  ShellStateView,
  ShellStatusBannerView,
} from "@/lib/app-shell-view-models";
import { copyFor } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ShellActionHandler = (actionId: string) => void;

const iconMap = {
  alert: CircleAlert,
  bookmark: Bookmark,
  calendar: Calendar,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  coins: Coins,
  filter: Filter,
  loader: Loader2,
  lock: Lock,
  logout: LogOut,
  map: MapIcon,
  settings: Settings,
  ticket: Ticket,
  user: User,
  x: X,
} satisfies Record<ShellIconName, ComponentType<{ className?: string }>>;

function ShellIcon({
  name,
  className,
}: {
  name?: ShellIconName;
  className?: string;
}) {
  if (!name) return null;
  const Icon = iconMap[name];
  return (
    <Icon
      className={cn("size-4", name === "loader" && "animate-spin", className)}
    />
  );
}

export function ShellLogo({
  variant = "black",
  className,
}: {
  variant?: "black" | "white";
  className?: string;
}) {
  return (
    <img
      src={variant ? `/logos/unveiled-logo-${variant}.svg` : undefined}
      alt="Unveiled"
      className={cn("h-7 w-auto md:h-9", className)}
    />
  );
}

function ShellActionButton({
  action,
  onAction,
  size = "sm",
  iconOnly = false,
  className,
}: {
  action: ShellActionView;
  onAction?: ShellActionHandler;
  size?: "sm" | "icon-sm";
  iconOnly?: boolean;
  className?: string;
}) {
  const variant =
    action.variant ?? (action.active ? "active" : iconOnly ? "muted" : "ghost");
  const content = (
    <>
      <ShellIcon name={action.icon} />
      {iconOnly ? null : <span>{action.label}</span>}
      {typeof action.count === "number" && action.count > 0 ? (
        <span
          className={cn(
            "grid min-w-5 place-items-center rounded-full bg-brand-dark px-1.5 py-0.5 text-[8px] leading-none text-white",
            iconOnly && "absolute -right-2 -top-2",
          )}
        >
          {action.count}
        </span>
      ) : null}
    </>
  );

  if (action.targetHref && !action.disabled && !action.loading) {
    return (
      <a
        href={action.targetHref}
        aria-label={action.ariaLabel ?? (iconOnly ? action.label : undefined)}
        className={cn(
          buttonVariants({ variant, size: iconOnly ? "icon-sm" : size }),
          "relative",
          className,
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon-sm" : size}
      loading={action.loading}
      disabled={action.disabled}
      aria-label={action.ariaLabel ?? (iconOnly ? action.label : undefined)}
      className={cn("relative", className)}
      onClick={() => onAction?.(action.id)}
    >
      {content}
    </Button>
  );
}

function LanguageToggle({
  shell,
  onAction,
  className,
}: {
  shell: AppShellViewModel;
  onAction?: ShellActionHandler;
  className?: string;
}) {
  const copy = copyFor(shell.language.selected).shell.nav;
  return (
    // biome-ignore lint/a11y/useSemanticElements: <fieldset> would add a visible legend/border that conflicts with the segmented-button visual treatment; role="group" is the correct ARIA pattern for a non-form grouping of toggle buttons.
    <div
      role="group"
      aria-label={copy.languageGroup}
      className={cn(
        "flex shrink-0 overflow-hidden border-2 border-brand-dark bg-brand-grey",
        className,
      )}
    >
      {shell.language.options.map((language) => {
        const isActive = shell.language.selected === language;
        return (
          <button
            key={language}
            type="button"
            aria-pressed={isActive}
            className={cn(
              "px-2 py-1 text-[9px] font-black uppercase transition-colors md:px-3 md:text-[10px]",
              isActive
                ? "bg-brand-dark text-white"
                : "text-brand-dark/45 hover:text-brand-dark",
            )}
            onClick={() => onAction?.(`language:${language}`)}
          >
            {language}
          </button>
        );
      })}
    </div>
  );
}

export function ShellNavigation({
  shell,
  onAction,
}: {
  shell: AppShellViewModel;
  onAction?: ShellActionHandler;
}) {
  const isGuest = shell.viewerContext === "guest";
  const isMember = shell.viewerContext === "member";
  const copy = copyFor(shell.language.selected).shell.nav;
  const isOperational =
    shell.viewerContext === "admin" || shell.viewerContext === "partner";

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-brand-dark bg-white md:border-b-4">
      <div className="content-shell">
        <div className="flex min-h-16 items-center justify-between gap-3 md:min-h-20 md:gap-4">
          <a
            href={`/${shell.language.selected.toLowerCase()}/`}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <ShellLogo variant={shell.logo.variant} />
            {shell.tagline ? (
              <span className="hidden max-w-56 text-[8px] font-black uppercase tracking-[0.25em] opacity-45 md:block">
                {shell.tagline}
              </span>
            ) : null}
          </a>

          <div className="hidden min-w-0 items-center gap-1 lg:flex">
            {shell.navItems
              .filter((item) => isGuest || isOperational || !item.icon)
              .map((item) => (
                <ShellActionButton
                  key={item.id}
                  action={item}
                  onAction={onAction}
                  className="shrink-0"
                />
              ))}
          </div>

          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            {isMember ? (
              <>
                {shell.navItems
                  .filter((item) => item.icon)
                  .map((item) => (
                    <ShellActionButton
                      key={item.id}
                      action={item}
                      onAction={onAction}
                      iconOnly
                      className="hidden lg:inline-flex"
                    />
                  ))}
                {typeof shell.creditCount === "number" ? (
                  <Badge tone="yellow" className="hidden sm:inline-flex">
                    <Coins className="size-3" />
                    {shell.creditCount} {copy.credits}
                  </Badge>
                ) : null}
                {shell.showProfile ? (
                  <ShellActionButton
                    action={{
                      id: "profile",
                      label: copy.profile,
                      icon: "user",
                      active: shell.activeItem === "profile",
                      targetHref: `/${shell.language.selected.toLowerCase()}/profile`,
                    }}
                    onAction={onAction}
                    iconOnly
                    className="hidden lg:inline-flex"
                  />
                ) : null}
              </>
            ) : null}

            {isGuest && shell.primaryAction ? (
              <ShellActionButton
                action={shell.primaryAction}
                onAction={onAction}
                className={
                  shell.activeItem === "landing" ? "hidden sm:inline-flex" : ""
                }
              />
            ) : null}

            <LanguageToggle
              shell={shell}
              onAction={onAction}
              className="hidden lg:flex"
            />

            {shell.showLogout ? (
              <ShellActionButton
                action={{ id: "logout", label: copy.logout, icon: "logout" }}
                onAction={onAction}
                iconOnly
                className="hidden lg:inline-flex"
              />
            ) : null}

            <button
              type="button"
              className="lg:hidden flex items-center justify-center size-9 md:size-10 border-2 border-brand-dark bg-white hover:bg-brand-cream transition-colors text-brand-dark"
              onClick={() => setDrawerOpen(true)}
              aria-label={copy.openMenu}
              aria-expanded={drawerOpen}
              aria-controls="shell-mobile-drawer"
            >
              <Menu className="size-5 md:size-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {drawerOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss
        <div
          className="fixed inset-0 z-[100] bg-brand-dark/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        id="shell-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shell-mobile-drawer-heading"
        className={cn(
          "fixed inset-y-0 right-0 z-[101] w-80 max-w-full bg-white border-l-4 border-brand-dark p-6 transition-transform duration-300 ease-in-out transform lg:hidden flex flex-col justify-between",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <ShellLogo variant={shell.logo.variant} className="h-7 w-auto" />
            <button
              type="button"
              className="flex items-center justify-center size-9 md:size-10 border-2 border-brand-dark bg-white hover:bg-brand-cream transition-colors text-brand-dark"
              onClick={() => setDrawerOpen(false)}
              aria-label={copy.closeMenu}
            >
              <X className="size-5 md:size-6" />
            </button>
          </div>

          <h2 id="shell-mobile-drawer-heading" className="sr-only">
            {copy.menuHeading}
          </h2>

          <nav className="flex flex-col gap-2">
            {shell.navItems
              .filter((item) => isGuest || isOperational || !item.icon)
              .map((item) => (
                <ShellActionButton
                  key={item.id}
                  action={item}
                  onAction={(actionId) => {
                    setDrawerOpen(false);
                    onAction?.(actionId);
                  }}
                  className="w-full justify-start"
                />
              ))}

            {isMember && (
              <>
                {shell.navItems
                  .filter((item) => item.icon)
                  .map((item) => (
                    <ShellActionButton
                      key={item.id}
                      action={item}
                      onAction={(actionId) => {
                        setDrawerOpen(false);
                        onAction?.(actionId);
                      }}
                      className="w-full justify-start"
                    />
                  ))}
                {typeof shell.creditCount === "number" ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-widest">
                    <Coins className="size-4" />
                    <span>
                      {shell.creditCount} {copy.credits}
                    </span>
                  </div>
                ) : null}
                {shell.showProfile ? (
                  <ShellActionButton
                    action={{
                      id: "profile",
                      label: copy.profile,
                      icon: "user",
                      active: shell.activeItem === "profile",
                      targetHref: `/${shell.language.selected.toLowerCase()}/profile`,
                    }}
                    onAction={(actionId) => {
                      setDrawerOpen(false);
                      onAction?.(actionId);
                    }}
                    className="w-full justify-start"
                  />
                ) : null}
              </>
            )}
          </nav>
        </div>

        <div className="space-y-6 border-t-2 border-brand-dark/20 pt-6">
          <div className="flex justify-center">
            <LanguageToggle
              shell={shell}
              onAction={(actionId) => {
                setDrawerOpen(false);
                onAction?.(actionId);
              }}
            />
          </div>

          {shell.showLogout ? (
            <ShellActionButton
              action={{ id: "logout", label: copy.logout, icon: "logout" }}
              onAction={(actionId) => {
                setDrawerOpen(false);
                onAction?.(actionId);
              }}
              className="w-full justify-start"
            />
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export function AppShell({
  shell,
  children,
  onAction,
}: {
  shell: AppShellViewModel;
  children: ReactNode;
  onAction?: ShellActionHandler;
}) {
  return (
    <div className="page-shell min-h-screen text-brand-dark selection:bg-brand-dark selection:text-brand-yellow">
      <ShellNavigation shell={shell} onAction={onAction} />
      <main className="content-shell space-y-6 pb-16">{children}</main>
    </div>
  );
}

export function ShellStatusBanner({
  status,
  onAction,
}: {
  status: ShellStatusBannerView;
  onAction?: ShellActionHandler;
}) {
  const tone =
    status.type === "error"
      ? "dark"
      : status.type === "warning"
        ? "dark"
        : "cream";

  return (
    <Panel
      tone={tone}
      shadow={status.type === "warning" || status.type === "error"}
      className="flex flex-wrap items-center justify-between gap-4 p-4"
    >
      <div className="flex min-w-0 items-start gap-3">
        <ShellIcon name={status.icon} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          {status.label ? (
            <p className="unveiled-meta opacity-60">{status.label}</p>
          ) : null}
          <p className="text-sm font-bold uppercase tracking-widest">
            {status.message}
          </p>
          {status.supportEmail ? (
            <p className="mt-1 text-xs font-black uppercase tracking-widest opacity-70">
              {status.supportEmail}
            </p>
          ) : null}
        </div>
      </div>
      {status.action ? (
        <ShellActionButton
          action={{
            ...status.action,
            variant: tone === "dark" ? "yellow" : status.action.variant,
          }}
          onAction={onAction}
        />
      ) : null}
    </Panel>
  );
}

export function PageShell({
  page,
  children,
  onAction,
}: {
  page?: PageShellViewModel;
  children: ReactNode;
  onAction?: ShellActionHandler;
}) {
  return (
    <div className="space-y-6 py-6 md:py-8">
      {page?.breadcrumbs?.length ? (
        <nav className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-55">
          {page.breadcrumbs.map((breadcrumb, index) => (
            <span
              key={breadcrumb.targetId ?? breadcrumb.label}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                disabled={breadcrumb.current}
                className={cn(
                  "hover:opacity-100 disabled:cursor-default",
                  breadcrumb.current && "opacity-100",
                )}
                onClick={() =>
                  breadcrumb.targetId
                    ? onAction?.(breadcrumb.targetId)
                    : undefined
                }
              >
                {breadcrumb.label}
              </button>
              {index < (page.breadcrumbs?.length ?? 0) - 1 ? (
                <span>/</span>
              ) : null}
            </span>
          ))}
        </nav>
      ) : null}

      {page?.title || page?.eyebrow || page?.actions?.length ? (
        <Panel
          tone="white"
          className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div>
            {page.eyebrow ? <Badge tone="yellow">{page.eyebrow}</Badge> : null}
            {page.title ? (
              <h1 className="headline-lg mt-5">{page.title}</h1>
            ) : null}
            {page.subtitle ? (
              <p className="mt-4 max-w-3xl text-sm font-bold uppercase tracking-widest opacity-60 md:text-base">
                {page.subtitle}
              </p>
            ) : null}
          </div>
          {page.actions?.length ? (
            <div className="flex flex-wrap gap-2 md:justify-end">
              {page.actions.map((action) => (
                <ShellActionButton
                  key={action.id}
                  action={action}
                  onAction={onAction}
                />
              ))}
            </div>
          ) : null}
        </Panel>
      ) : null}

      {page?.statuses?.length ? (
        <div className="grid gap-3">
          {page.statuses.map((status) => (
            <ShellStatusBanner
              key={status.id}
              status={status}
              onAction={onAction}
            />
          ))}
        </div>
      ) : null}

      {page?.state ? (
        <GlobalStateWrapper state={page.state} onAction={onAction} />
      ) : (
        children
      )}
    </div>
  );
}

export function GlobalStateWrapper({
  state,
  onAction,
}: {
  state: ShellStateView;
  onAction?: ShellActionHandler;
}) {
  const action = state.retryAction ?? state.ctaAction;

  return (
    <StatePanel
      title={state.title}
      text={state.message}
      state={state.state}
      action={
        action ? (
          <ShellActionButton
            action={{
              ...action,
              variant: state.state === "error" ? "primary" : action.variant,
            }}
            onAction={onAction}
          />
        ) : undefined
      }
    />
  );
}

export function DiscoveryShell({
  discovery,
  filterPanel,
  mapPanel,
  children,
  onAction,
}: {
  discovery: DiscoveryShellViewModel;
  filterPanel?: ReactNode;
  mapPanel?: ReactNode;
  children: ReactNode;
  onAction?: ShellActionHandler;
}) {
  return (
    <div className="space-y-6">
      <Panel
        tone="white"
        className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5"
      >
        <div>
          <p className="unveiled-meta opacity-45">Active range</p>
          <p className="text-sm font-black uppercase tracking-widest md:text-lg">
            {discovery.activeRangeLabel}
          </p>
        </div>
        <p className="text-right text-[10px] font-black uppercase tracking-widest opacity-55">
          {discovery.resultCountLabel}
        </p>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 md:gap-6">
        <button
          type="button"
          className={cn(
            "flex items-center justify-between gap-4 border-4 border-brand-dark p-5 text-left transition-colors unveiled-shadow",
            discovery.filtersOpen
              ? "bg-brand-dark text-white"
              : "bg-white hover:bg-brand-cream",
          )}
          onClick={() => onAction?.("toggle-filters")}
        >
          <span className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] md:text-sm">
            <Filter className="size-5" />
            {discovery.filterToggleLabel}
            {discovery.activeFilterCount > 0
              ? ` (${discovery.activeFilterCount})`
              : ""}
          </span>
          {discovery.filtersOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center justify-between gap-4 border-4 border-brand-dark p-5 text-left transition-colors unveiled-shadow",
            discovery.mapOpen
              ? "bg-brand-dark text-white"
              : "bg-white hover:bg-brand-cream",
          )}
          onClick={() => onAction?.("toggle-map")}
        >
          <span className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] md:text-sm">
            <MapIcon className="size-5" />
            {discovery.mapToggleLabel}
          </span>
          {discovery.mapOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {discovery.filtersOpen && filterPanel ? (
        <div className="animate-in slide-in-from-top-4 duration-300">
          {filterPanel}
        </div>
      ) : null}
      {discovery.mapOpen && mapPanel ? (
        <div className="animate-in zoom-in-95 duration-300">{mapPanel}</div>
      ) : null}
      {discovery.visibleResultCount > 0 ? (
        children
      ) : discovery.emptyState ? (
        <GlobalStateWrapper state={discovery.emptyState} onAction={onAction} />
      ) : null}
    </div>
  );
}

export function ModalShell({
  modal,
  children,
  onAction,
  language = "EN",
}: {
  modal: ModalShellViewModel;
  children: ReactNode;
  onAction?: ShellActionHandler;
  language?: import("@/lib/i18n").UiLanguage;
}) {
  const copy = copyFor(language).shell.state;
  useEffect(() => {
    if (!modal.open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [modal.open]);

  if (!modal.open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-brand-yellow">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b-4 border-brand-dark bg-brand-yellow/90 p-5 backdrop-blur md:p-10">
        <div className="flex min-w-0 items-center gap-4">
          <ShellLogo variant={modal.logoVariant} />
          {modal.metadata ? (
            <span className="hidden text-[10px] font-black uppercase tracking-widest opacity-45 sm:inline">
              {modal.metadata}
            </span>
          ) : null}
        </div>
        {modal.closeAvailable ? (
          <button
            type="button"
            className="transition-transform hover:rotate-90"
            onClick={() => onAction?.("close-modal")}
            aria-label="Close"
          >
            <X className="size-10 md:size-12" />
          </button>
        ) : null}
      </header>

      <div
        className={cn(
          "mx-auto grid w-full max-w-7xl gap-8 p-5 md:p-10",
          modal.layout === "split" && "lg:grid-cols-[1fr_0.9fr] lg:gap-16",
        )}
      >
        {modal.loading ? (
          <GlobalStateWrapper
            state={{
              state: "loading",
              title: copy.loading,
              message: copy.modalLoading,
              icon: "loader",
            }}
            onAction={onAction}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
