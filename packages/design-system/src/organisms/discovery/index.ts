export * from "./discovery-filter-panel";
export * from "./discovery-map";
export * from "./public-discover";

import * as DiscoveryFilterPanel from "./discovery-filter-panel";
import * as DiscoveryMap from "./discovery-map";
import * as PublicDiscover from "./public-discover";

export const Discovery = {
  ...DiscoveryFilterPanel,
  ...DiscoveryMap,
  ...PublicDiscover,
} as const;
