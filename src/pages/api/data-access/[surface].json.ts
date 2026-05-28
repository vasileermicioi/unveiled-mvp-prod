import type { APIRoute } from "astro";

import { AuthAccessError, getViewer, toAuthResponse } from "@/lib/auth-profile";
import {
  loadAdminData,
  loadCurrentPartnerData,
  loadMemberData,
  loadPublicDiscoveryData,
} from "@/lib/data-access/loaders";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    if (params.surface === "public-discovery") {
      const viewer = await getViewer(request);
      return Response.json({
        surface: "public-discovery",
        data: await loadPublicDiscoveryData(
          filtersFromUrl(request.url),
          undefined,
          viewer.language,
        ),
      });
    }

    if (params.surface === "member") {
      return Response.json({
        surface: "member",
        data: await loadMemberData(request, filtersFromUrl(request.url)),
      });
    }

    if (params.surface === "partner") {
      return Response.json({
        surface: "partner",
        data: await loadCurrentPartnerData(request),
      });
    }

    if (params.surface === "admin") {
      return Response.json({
        surface: "admin",
        data: await loadAdminData(request, filtersFromUrl(request.url)),
      });
    }

    return Response.json(
      {
        ok: false,
        error: "not_found",
        message: "Data surface is not available.",
      },
      { status: 404 },
    );
  } catch (error) {
    if (error instanceof AuthAccessError) {
      return toAuthResponse(error);
    }

    return Response.json(
      {
        ok: false,
        error: "data_access_failed",
        message: "Data request failed.",
      },
      { status: 500 },
    );
  }
};

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
