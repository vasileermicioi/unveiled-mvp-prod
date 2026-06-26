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
import { z } from "zod";

const PublicDiscoveryQuerySchema = z.object({
  category: z.string().optional(),
  partnerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  savedOnly: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(6),
});

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
      const search = new URL(url).searchParams;

      if (surface === "public-discovery") {
        const viewer = await getViewer(c.req.raw);
        const filters = filtersFromUrl(url);
        const parsed = PublicDiscoveryQuerySchema.safeParse({
          category: filters.category,
          partnerId: filters.partnerId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          savedOnly: filters.savedOnly,
          page: search.get("page") ?? undefined,
          pageSize: search.get("pageSize") ?? undefined,
        });
        const publicFilters = parsed.success
          ? {
              ...filters,
              page: String(parsed.data.page),
              pageSize: String(parsed.data.pageSize),
            }
          : filters;
        return c.json({
          surface: "public-discovery",
          data: await loadPublicDiscoveryData(
            publicFilters,
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
        const partnerFilters = {
          partnerGuestsPage: search.get("partnerGuestsPage") ?? undefined,
          partnerGuestsPageSize:
            search.get("partnerGuestsPageSize") ?? undefined,
        };
        return c.json({
          surface: "partner",
          data: await loadCurrentPartnerData(c.req.raw, partnerFilters),
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
