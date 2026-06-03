import type {
  AppShellViewModel,
  PageShellViewModel,
  ShellNavItemId,
} from "@/lib/app-shell-view-models";
import type { AuthFormState } from "@/lib/auth-forms";
import {
  AuthAccessError,
  type AuthenticatedViewer,
  type AuthFailure,
  authFailure,
  getViewer,
  requireAdmin,
  requireMember,
  requirePartnerForResource,
  requireUser,
  type Viewer,
} from "@/lib/auth-profile";
import { copyFor } from "@/lib/i18n";
import { routePathFor } from "@/lib/product-routes";

function publicNavItems(language: AppShellViewModel["language"]["selected"]) {
  const copy = copyFor(language).shell.nav;
  const prefix = `/${language.toLowerCase()}`;
  return [
    {
      id: "discover",
      itemId: "discover",
      label: copy.discover,
      targetHref: `${prefix}${routePathFor("discover")}`,
    },
    {
      id: "how",
      itemId: "how",
      label: copy.how,
      targetHref: `${prefix}${routePathFor("how")}`,
    },
    {
      id: "membership",
      itemId: "membership",
      label: copy.membership,
      targetHref: `${prefix}${routePathFor("membership")}`,
    },
    {
      id: "faq",
      itemId: "faq",
      label: copy.faq,
      targetHref: `${prefix}${routePathFor("faq")}`,
    },
  ] satisfies AppShellViewModel["navItems"];
}

function memberNavItems(
  activeItem: ShellNavItemId,
  savedCount: number,
  language: AppShellViewModel["language"]["selected"],
) {
  const copy = copyFor(language).shell.nav;
  const prefix = `/${language.toLowerCase()}`;
  return [
    {
      id: "member",
      itemId: "member",
      label: copy.member,
      targetHref: `${prefix}${routePathFor("member")}`,
      active: activeItem === "member" || activeItem === "saved",
    },
    {
      id: "faq",
      itemId: "faq",
      label: copy.faq,
      targetHref: `${prefix}${routePathFor("faq")}`,
      active: activeItem === "faq",
    },
    {
      id: "saved",
      itemId: "saved",
      label: copy.saved,
      targetHref: `${prefix}${routePathFor("saved")}`,
      icon: "bookmark",
      collapseLabel: true,
      count: savedCount,
      active: activeItem === "saved",
    },
    {
      id: "bookings",
      itemId: "bookings",
      label: copy.bookings,
      targetHref: `${prefix}${routePathFor("bookings")}`,
      icon: "ticket",
      collapseLabel: true,
      active: activeItem === "bookings",
    },
  ] satisfies AppShellViewModel["navItems"];
}

function operationalNavItem(viewer: AuthenticatedViewer) {
  const prefix = `/${viewer.language.toLowerCase()}`;
  return [
    {
      id: viewer.viewerContext,
      itemId: viewer.viewerContext,
      label: viewer.viewerContext === "admin" ? "Admin" : "Partner",
      targetHref: `${prefix}${routePathFor(viewer.viewerContext)}`,
      icon: "settings",
      active: true,
    },
  ] satisfies AppShellViewModel["navItems"];
}

export function createShellFromViewer(
  viewer: Viewer,
  activeItem: ShellNavItemId,
): AppShellViewModel {
  const isGuest = viewer.kind === "guest";
  const isMember = viewer.kind === "authenticated" && viewer.role === "USER";
  const copy = copyFor(viewer.language);
  const shellNav = copy.shell.nav;
  const prefix = `/${viewer.language.toLowerCase()}`;

  return {
    viewerContext: viewer.viewerContext,
    activeItem,
    logo: { variant: "black", alt: "Unveiled" },
    language: { selected: viewer.language, options: ["DE", "EN"] },
    tagline: isGuest ? copy.shell.tagline : undefined,
    navItems: isGuest
      ? publicNavItems(viewer.language).map((item) => ({
          ...item,
          active: item.itemId === activeItem,
        }))
      : isMember
        ? memberNavItems(activeItem, viewer.savedCount, viewer.language)
        : operationalNavItem(viewer),
    primaryAction: isGuest
      ? {
          id: activeItem === "membership" ? "login" : "membership",
          label:
            activeItem === "membership"
              ? shellNav.login
              : shellNav.becomeMember,
          targetHref:
            activeItem === "membership"
              ? `${prefix}/`
              : `${prefix}${routePathFor("membership")}`,
          variant: activeItem === "membership" ? "secondary" : "primary",
        }
      : undefined,
    savedCount: viewer.kind === "authenticated" ? viewer.savedCount : undefined,
    creditCount: isMember ? viewer.credits : undefined,
    showProfile: viewer.kind === "authenticated" && viewer.showProfile,
    showLogout: viewer.kind === "authenticated" && viewer.showLogout,
  };
}

export async function createShellFromRequest(
  request: Request,
  activeItem: ShellNavItemId,
) {
  return createShellFromViewer(await getViewer(request), activeItem);
}

export function authFailurePageState(
  failure: AuthFailure,
  language: import("@/lib/i18n").UiLanguage = "EN",
): PageShellViewModel {
  const copy = copyFor(language).shell.state;
  return {
    state: {
      state: failure.code === "forbidden" ? "error" : "empty",
      title:
        failure.code === "forbidden"
          ? copy.accessUnavailable
          : copy.signInRequired,
      message: failure.message,
      icon: failure.code === "forbidden" ? "lock" : "user",
      ctaAction:
        failure.code === "unauthenticated"
          ? { id: "login", label: copy.login, variant: "primary" }
          : undefined,
    },
  };
}

export function authFormPageState(state: AuthFormState): PageShellViewModel {
  return {
    statuses:
      state.status === "idle"
        ? undefined
        : [
            {
              id: `auth-${state.status}`,
              type:
                state.status === "success"
                  ? "success"
                  : state.status === "loading"
                    ? "notice"
                    : "error",
              message: state.message ?? "Authentication request updated.",
              icon: state.status === "loading" ? "loader" : "lock",
            },
          ],
  };
}

type PageAccess =
  | { ok: true; viewer: AuthenticatedViewer }
  | { ok: false; page: PageShellViewModel; failure: AuthFailure };

function accessFailure(
  error: unknown,
  language?: import("@/lib/i18n").UiLanguage,
): PageAccess {
  if (error instanceof AuthAccessError) {
    const failure = authFailure(error.code);
    return {
      ok: false,
      failure,
      page: authFailurePageState(failure, language),
    };
  }

  const failure = authFailure("forbidden");
  return {
    ok: false,
    failure,
    page: authFailurePageState(failure, language),
  };
}

export async function requireMemberPage(
  request: Request,
  language?: import("@/lib/i18n").UiLanguage,
): Promise<PageAccess> {
  try {
    return { ok: true, viewer: await requireMember(request) };
  } catch (error) {
    return accessFailure(error, language);
  }
}

export async function requireAdminPage(
  request: Request,
  language?: import("@/lib/i18n").UiLanguage,
): Promise<PageAccess> {
  try {
    return { ok: true, viewer: await requireAdmin(request) };
  } catch (error) {
    return accessFailure(error, language);
  }
}

export async function requirePartnerPage(
  request: Request,
  resourcePartnerId: string,
  language?: import("@/lib/i18n").UiLanguage,
): Promise<PageAccess> {
  try {
    return {
      ok: true,
      viewer: await requirePartnerForResource(request, resourcePartnerId),
    };
  } catch (error) {
    return accessFailure(error, language);
  }
}

export async function requireSignedInPage(
  request: Request,
  language?: import("@/lib/i18n").UiLanguage,
): Promise<PageAccess> {
  try {
    return { ok: true, viewer: await requireUser(request) };
  } catch (error) {
    return accessFailure(error, language);
  }
}
