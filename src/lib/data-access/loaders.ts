import { type Db, db } from "@/db/client";
import {
  AuthAccessError,
  authFailure,
  requireAdmin,
  requireMember,
  requirePartnerForResource,
  requireUser,
  type Viewer,
} from "@/lib/auth-profile";
import type { UiLanguage } from "@/lib/i18n";
import type { DiscoveryFilters } from "./query-keys";
import {
  getAdminData,
  getMemberData,
  getPartnerData,
  getPublicDiscoveryData,
} from "./repositories";

export async function loadPublicDiscoveryData(
  filters: DiscoveryFilters = {},
  database: Db = db,
  language: UiLanguage = "EN",
) {
  return getPublicDiscoveryData(filters, database, language);
}

export async function loadMemberData(
  input: Viewer | Request | Headers,
  filters: DiscoveryFilters = {},
  database: Db = db,
) {
  const viewer = await requireMember(input);
  return getMemberData(viewer.user.id, filters, database);
}

export async function loadPartnerData(
  input: Viewer | Request | Headers,
  partnerId: string,
  database: Db = db,
) {
  await requirePartnerForResource(input, partnerId);
  const data = await getPartnerData(partnerId, database);
  if (!data) throw new AuthAccessError(authFailure("forbidden"));
  return data;
}

export async function loadCurrentPartnerData(
  input: Viewer | Request | Headers,
  database: Db = db,
) {
  const viewer = await requireUser(input);
  if (viewer.role !== "PARTNER" || !viewer.partnerId) {
    throw new AuthAccessError(authFailure("forbidden"));
  }
  return loadPartnerData(input, viewer.partnerId, database);
}

export async function loadAdminData(
  input: Viewer | Request | Headers,
  filters?: DiscoveryFilters & {
    membersPage?: string;
    membersPageSize?: string;
    partnersPage?: string;
    partnersPageSize?: string;
    eventsPage?: string;
    eventsPageSize?: string;
  },
  database: Db = db,
) {
  await requireAdmin(input);
  return getAdminData(filters, database);
}
