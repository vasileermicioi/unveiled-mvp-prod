import {
  type AppType,
  AuthAccessError,
  getViewer,
  loadAdminData,
  loadCurrentPartnerData,
  loadMemberData,
  loadPublicDiscoveryData,
  toAuthResponse,
} from "@unveiled/api/worker";

function filtersFromUrl(url: string) {
  const search = new URL(url).searchParams;
  return {
    category: search.get("category") ?? undefined,
    partnerId: search.get("partnerId") ?? undefined,
    startDate: search.get("startDate") ?? undefined,
    endDate: search.get("endDate") ?? undefined,
    savedOnly: search.get("savedOnly") ?? undefined,
    membersPage: search.get("membersPage") ?? undefined,
    membersPageSize: search.get("membersPageSize") ?? undefined,
    partnersPage: search.get("partnersPage") ?? undefined,
    partnersPageSize: search.get("partnersPageSize") ?? undefined,
    eventsPage: search.get("eventsPage") ?? undefined,
    eventsPageSize: search.get("eventsPageSize") ?? undefined,
  };
}

export function mountDataAccessRoutes(app: AppType): void {
  app.get("/api/data-access/:surface", async (c) => {
    try {
      const surface = c.req.param("surface");
      const url = c.req.url;

      if (surface === "public-discovery") {
        const viewer = await getViewer(c.req.raw);
        return c.json({
          surface: "public-discovery",
          data: await loadPublicDiscoveryData(
            filtersFromUrl(url),
            undefined,
            viewer.language,
          ),
        });
      }
      if (surface === "member") {
        return c.json({
          surface: "member",
          data: await loadMemberData(c.req.raw, filtersFromUrl(url)),
        });
      }
      if (surface === "partner") {
        return c.json({
          surface: "partner",
          data: await loadCurrentPartnerData(c.req.raw),
        });
      }
      if (surface === "admin") {
        return c.json({
          surface: "admin",
          data: await loadAdminData(c.req.raw, filtersFromUrl(url)),
        });
      }
      return c.json(
        {
          ok: false,
          error: "not_found",
          message: "Data surface is not available.",
        },
        404,
      );
    } catch (error) {
      if (error instanceof AuthAccessError) {
        return toAuthResponse(error);
      }
      return c.json(
        {
          ok: false,
          error: "data_access_failed",
          message: "Data request failed.",
        },
        500,
      );
    }
  });
}
