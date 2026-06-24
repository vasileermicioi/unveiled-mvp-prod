export * from "./partner-portal";

import * as PartnerPortal from "./partner-portal";

export const PartnerPortalDomain = {
  ...PartnerPortal,
} as const;
