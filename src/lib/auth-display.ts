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
  return [
    {
      id: "discover",
      itemId: "discover",
      label: copy.discover,
      targetHref: routePathFor("discover"),
    },
    {
      id: "how",
      itemId: "how",
      label: copy.how,
      targetHref: routePathFor("how"),
    },
    {
      id: "membership",
      itemId: "membership",
      label: copy.membership,
      targetHref: routePathFor("membership"),
    },
    {
      id: "faq",
      itemId: "faq",
      label: copy.faq,
      targetHref: routePathFor("faq"),
    },
  ] satisfies AppShellViewModel["navItems"];
}

function memberNavItems(
  activeItem: ShellNavItemId,
  savedCount: number,
  language: AppShellViewModel["language"]["selected"],
) {
  const copy = copyFor(language).shell.nav;
  return [
    {
      id: "member",
      itemId: "member",
      label: copy.member,
      targetHref: routePathFor("member"),
      active: activeItem === "member" || activeItem === "saved",
    },
    {
      id: "faq",
      itemId: "faq",
      label: copy.faq,
      targetHref: routePathFor("faq"),
      active: activeItem === "faq",
    },
    {
      id: "saved",
      itemId: "saved",
      label: copy.saved,
      targetHref: routePathFor("saved"),
      icon: "bookmark",
      collapseLabel: true,
      count: savedCount,
      active: activeItem === "saved",
    },
    {
      id: "bookings",
      itemId: "bookings",
      label: copy.bookings,
      targetHref: routePathFor("bookings"),
      icon: "ticket",
      collapseLabel: true,
      active: activeItem === "bookings",
    },
  ] satisfies AppShellViewModel["navItems"];
}

function operationalNavItem(viewer: AuthenticatedViewer) {
  return [
    {
      id: viewer.viewerContext,
      itemId: viewer.viewerContext,
      label: viewer.viewerContext === "admin" ? "Admin" : "Partner",
      targetHref: routePathFor(viewer.viewerContext),
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
            activeItem === "membership" ? "/" : routePathFor("membership"),
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

export function authFailurePageState(failure: AuthFailure): PageShellViewModel {
  const copy = copyFor("EN").shell.state;
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

function accessFailure(error: unknown): PageAccess {
  if (error instanceof AuthAccessError) {
    const failure = authFailure(error.code);
    return {
      ok: false,
      failure,
      page: authFailurePageState(failure),
    };
  }

  const failure = authFailure("forbidden");
  return {
    ok: false,
    failure,
    page: authFailurePageState(failure),
  };
}

export async function requireMemberPage(request: Request): Promise<PageAccess> {
  try {
    return { ok: true, viewer: await requireMember(request) };
  } catch (error) {
    return accessFailure(error);
  }
}

export async function requireAdminPage(request: Request): Promise<PageAccess> {
  try {
    return { ok: true, viewer: await requireAdmin(request) };
  } catch (error) {
    return accessFailure(error);
  }
}

export async function requirePartnerPage(
  request: Request,
  resourcePartnerId: string,
): Promise<PageAccess> {
  try {
    return {
      ok: true,
      viewer: await requirePartnerForResource(request, resourcePartnerId),
    };
  } catch (error) {
    return accessFailure(error);
  }
}

export async function requireSignedInPage(
  request: Request,
): Promise<PageAccess> {
  try {
    return { ok: true, viewer: await requireUser(request) };
  } catch (error) {
    return accessFailure(error);
  }
}
