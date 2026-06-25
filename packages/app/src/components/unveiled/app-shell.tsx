import {
  AppShellPresentational,
  Badge,
  Button,
  buttonVariants,
  Card,
  cn,
  ShellIconButtonPresentational,
  ShellLogoPresentational,
  ShellMobileDrawerPresentational,
  StatePanel,
} from "@unveiled/design-system";
// source: lucide-react (ISC-licensed; full inline <svg> migration deferred to iteration-13 proposal 07)
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
import { useDeferredValue, useEffect, useState } from "react";
import { APP_BASE_PREFIX } from "~/lib/app-base";
import type {
  AppShellViewModel,
  DiscoveryShellViewModel,
  ModalShellViewModel,
  PageShellViewModel,
  ShellActionView,
  ShellIconName,
  ShellStateView,
  ShellStatusBannerView,
} from "~/lib/app-shell-view-models";
import { copyFor } from "~/lib/i18n";

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
      className={cn(
        "ui-100c22d5",
        name === "loader" && "ui-2c14b55d",
        className,
      )}
    />
  );
}

export const ShellLogo = ShellLogoPresentational;

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
            "ui-573cecee",
            iconOnly && "-right-2 -top-2 ui-c5119445",
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
          "ui-d2d9e1f1",
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
      className={cn("ui-d2d9e1f1", className)}
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
      className={cn("ui-58eca808", className)}
    >
      {shell.language.options.map((language) => {
        const isActive = shell.language.selected === language;
        return (
          <button
            key={language}
            type="button"
            aria-pressed={isActive}
            className={cn(
              "ui-f9e86502",
              isActive ? "ui-806c1ffa" : "hover:text-brand-dark ui-f9351370",
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
    <nav className="ui-254d25d9">
      <div className="content-shell">
        <div className="ui-0eb15c9f">
          <a
            href={`/app/${shell.language.selected.toLowerCase()}/`}
            className="ui-44fc928b"
          >
            <ShellLogo variant={shell.logo.variant} />
            {shell.tagline ? (
              <span className="ui-79921d55">{shell.tagline}</span>
            ) : null}
          </a>

          <div className="ui-f9d68e3d">
            {shell.navItems
              .filter((item) => isGuest || isOperational || !item.icon)
              .map((item) => (
                <ShellActionButton
                  key={item.id}
                  action={item}
                  onAction={onAction}
                  className="ui-27ead27a"
                />
              ))}
          </div>

          <div className="ui-f6809ba4">
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
                      className="ui-ced5541f"
                    />
                  ))}
                {typeof shell.creditCount === "number" ? (
                  <Badge tone="yellow" className="ui-3b31bfb1">
                    <Coins className="ui-5e34f531" />
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
                      targetHref: `${APP_BASE_PREFIX}/${shell.language.selected.toLowerCase()}/profile`,
                    }}
                    onAction={onAction}
                    iconOnly
                    className="ui-ced5541f"
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
              className="ui-1427f7e7"
            />

            {shell.showLogout ? (
              <ShellActionButton
                action={{ id: "logout", label: copy.logout, icon: "logout" }}
                onAction={onAction}
                iconOnly
                className="ui-ced5541f"
              />
            ) : null}

            <ShellIconButtonPresentational
              onClick={() => setDrawerOpen(true)}
              aria-label={copy.openMenu}
              aria-expanded={drawerOpen}
              aria-controls="shell-mobile-drawer"
              className="ui-7baf6374"
            >
              <Menu className="ui-feac2c25" />
            </ShellIconButtonPresentational>
          </div>
        </div>
      </div>

      <ShellMobileDrawerPresentational
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        headingId="shell-mobile-drawer-heading"
        menuHeading={copy.menuHeading}
        closeIcon={<X className="ui-feac2c25" />}
        logo={
          <ShellLogo variant={shell.logo.variant} className="ui-ebf9f265" />
        }
        footer={
          <div className="form-shell">
            <div className="ui-7ef65f17">
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
                className="ui-f6005322"
              />
            ) : null}
          </div>
        }
      >
        <nav className="ui-7c5144aa">
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
                className="ui-f6005322"
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
                    className="ui-f6005322"
                  />
                ))}
              {typeof shell.creditCount === "number" ? (
                <div className="ui-1d3f0609">
                  <Coins className="ui-100c22d5" />
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
                    targetHref: `${APP_BASE_PREFIX}/${shell.language.selected.toLowerCase()}/profile`,
                  }}
                  onAction={(actionId) => {
                    setDrawerOpen(false);
                    onAction?.(actionId);
                  }}
                  className="ui-f6005322"
                />
              ) : null}
            </>
          )}
        </nav>
      </ShellMobileDrawerPresentational>
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
    <AppShellPresentational
      header={<ShellNavigation shell={shell} onAction={onAction} />}
    >
      {children}
    </AppShellPresentational>
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
    <Card
      tone={tone}
      shadow={status.type === "warning" || status.type === "error"}
      className="app-page-header"
    >
      <div className="ui-d741e326">
        <ShellIcon name={status.icon} className="ui-bb781639" />
        <div className="ui-184ddc11">
          {status.label ? (
            <p className="unveiled-meta ui-603a84e4">{status.label}</p>
          ) : null}
          <p className="ui-7bbbc0f2">{status.message}</p>
          {status.supportEmail ? (
            <p className="ui-4d38eb70">{status.supportEmail}</p>
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
    </Card>
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
    <div className="ui-f8afba82">
      {page?.breadcrumbs?.length ? (
        <nav className="ui-c694eebe">
          {page.breadcrumbs.map((breadcrumb, index) => (
            <span
              key={breadcrumb.targetId ?? breadcrumb.label}
              className="ui-00ebb85d"
            >
              <button
                type="button"
                disabled={breadcrumb.current}
                className={cn(
                  "hover:opacity-100 disabled:cursor-default",
                  breadcrumb.current && "ui-65694092",
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
        <Card tone="white" className="ui-f91c29fd">
          <div>
            {page.eyebrow ? <Badge tone="yellow">{page.eyebrow}</Badge> : null}
            {page.title ? (
              <h1 className="headline-lg ui-71dd032f">{page.title}</h1>
            ) : null}
            {page.subtitle ? (
              <p className="ui-c0cce89a">{page.subtitle}</p>
            ) : null}
          </div>
          {page.actions?.length ? (
            <div className="ui-9bc94b54">
              {page.actions.map((action) => (
                <ShellActionButton
                  key={action.id}
                  action={action}
                  onAction={onAction}
                />
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      {page?.statuses?.length ? (
        <div className="ui-c7f94043">
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
  const deferredResultCountLabel = useDeferredValue(discovery.resultCountLabel);
  const settledResultCountLabel =
    deferredResultCountLabel ?? discovery.resultCountLabel;
  return (
    <div className="form-shell">
      <Card tone="white" className="ui-8c0167c7">
        <div>
          <p className="unveiled-meta ui-378d3a2b">Active range</p>
          <p className="ui-fae6ebf9">{discovery.activeRangeLabel}</p>
        </div>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="ui-3ae82276"
        >
          {settledResultCountLabel}
        </p>
      </Card>

      <div className="ui-6211bda6">
        <button
          type="button"
          className={cn(
            "unveiled-shadow ui-33fb1aa3",
            discovery.filtersOpen
              ? "ui-806c1ffa"
              : "hover:bg-brand-cream ui-8f92dc82",
          )}
          onClick={() => onAction?.("toggle-filters")}
        >
          <span className="ui-6b56549b">
            <Filter className="ui-2bd43fb5" />
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
            "unveiled-shadow ui-33fb1aa3",
            discovery.mapOpen
              ? "ui-806c1ffa"
              : "hover:bg-brand-cream ui-8f92dc82",
          )}
          onClick={() => onAction?.("toggle-map")}
        >
          <span className="ui-6b56549b">
            <MapIcon className="ui-2bd43fb5" />
            {discovery.mapToggleLabel}
          </span>
          {discovery.mapOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {discovery.filtersOpen && filterPanel ? (
        <div className="slide-in-from-top-4 ui-f931927e">{filterPanel}</div>
      ) : null}
      {discovery.mapOpen && mapPanel ? (
        <div className="zoom-in-95 ui-46a604a9">{mapPanel}</div>
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
  language?: import("~/lib/i18n").UiLanguage;
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
    <div className="ui-92360ccc">
      <header className="ui-cbf7fa0e">
        <div className="ui-5607416b">
          <ShellLogo variant={modal.logoVariant} />
          {modal.metadata ? (
            <span className="ui-72ba2032">{modal.metadata}</span>
          ) : null}
        </div>
        {modal.closeAvailable ? (
          <button
            type="button"
            className="hover:rotate-90 ui-fdb712bb"
            onClick={() => onAction?.("close-modal")}
            aria-label="Close"
          >
            <X className="ui-89a17e82" />
          </button>
        ) : null}
      </header>

      <div
        className={cn("ui-19592cbb", modal.layout === "split" && "ui-f3d0625b")}
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
