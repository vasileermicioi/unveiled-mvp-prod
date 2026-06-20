import { type AuthenticatedViewer, type Viewer } from "~/lib/auth-profile";
import { copyFor, type UiLanguage } from "~/lib/i18n";
import {
  redirectAfterLoginFor,
  type ProductRouteOwner,
} from "~/lib/product-routes";

export interface RedirectAfterLoginTableProps {
  language: UiLanguage;
  viewer: AuthenticatedViewer;
}

const TARGET_OWNERS: ProductRouteOwner[] = ["member", "partner", "admin"];

function safeDestinationLabel(
  language: UiLanguage,
  destination: string | undefined,
): string {
  const bundle = copyFor(language).routing.redirectAfterLogin;
  if (!destination || destination === "/") {
    return bundle.publicSafeDestination;
  }
  if (destination === "/app") return bundle.memberSafeDestination;
  if (destination === "/partner") return bundle.partnerSafeDestination;
  if (destination === "/admin") return bundle.adminSafeDestination;
  return destination;
}

export function RedirectAfterLoginTable({
  language,
  viewer,
}: RedirectAfterLoginTableProps) {
  const bundle = copyFor(language).routing.redirectAfterLogin;

  return (
    <table
      role="table"
      aria-label={bundle.tableHeading}
      className="w-full border-collapse text-sm"
    >
      <caption className="sr-only">{bundle.tableHeading}</caption>
      <thead>
        <tr>
          <th scope="col" className="border-b p-2 text-left">
            {language === "DE" ? "Eigene Rolle" : "Viewer role"}
          </th>
          <th scope="col" className="border-b p-2 text-left">
            {language === "DE" ? "Zielort" : "Target route"}
          </th>
          <th scope="col" className="border-b p-2 text-left">
            {language === "DE" ? "Sicheres Ziel" : "Safe destination"}
          </th>
        </tr>
      </thead>
      <tbody>
        {TARGET_OWNERS.map((owner) => {
          const destination = redirectAfterLoginFor(viewer, owner);
          const cellKey =
            owner === "member"
              ? "cellMemberOnAdmin"
              : owner === "partner"
                ? "cellPartnerOnAdmin"
                : "cellAdminOnPartner";
          const cellLabel = bundle[cellKey];
          return (
            <tr key={owner} data-cell={`${viewer.role} × ${owner}`}>
              <th scope="row" className="border-b p-2 text-left font-medium">
                {viewer.role}
              </th>
              <td className="border-b p-2">{cellLabel}</td>
              <td className="border-b p-2">
                {safeDestinationLabel(language, destination)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function safeRedirectAfterLoginDestination(
  viewer: Viewer,
  owner: ProductRouteOwner,
): string | undefined {
  if (viewer.kind !== "authenticated") return undefined;
  return redirectAfterLoginFor(viewer, owner);
}
