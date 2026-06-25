import type { AuthenticatedViewer, Viewer } from "~/lib/auth-profile";
import { copyFor, type UiLanguage } from "~/lib/i18n";
import {
  type ProductRouteOwner,
  redirectAfterLoginFor,
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
    <table aria-label={bundle.tableHeading} className="ui-04757af0">
      <caption className="ui-32fb0905">{bundle.tableHeading}</caption>
      <thead>
        <tr>
          <th scope="col" className="ui-4d913672">
            {language === "DE" ? "Eigene Rolle" : "Viewer role"}
          </th>
          <th scope="col" className="ui-4d913672">
            {language === "DE" ? "Zielort" : "Target route"}
          </th>
          <th scope="col" className="ui-4d913672">
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
              <th scope="row" className="ui-df417f7a">
                {viewer.role}
              </th>
              <td className="ui-0c24bdc3">{cellLabel}</td>
              <td className="ui-0c24bdc3">
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
