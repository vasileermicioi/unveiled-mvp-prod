import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { DiscoveryFilterPanelPresentational } from "../../organisms/discovery/discovery-filter-panel/discovery-filter-panel";
import { makeMockDiscoveryFilterPanelProps } from "../../organisms/discovery/discovery-filter-panel/discovery-filter-panel.mock";
import { DiscoveryMapPresentational } from "../../organisms/discovery/discovery-map/discovery-map";
import { makeMockDiscoveryMapProps } from "../../organisms/discovery/discovery-map/discovery-map.mock";
import { PublicDiscoverPresentational } from "../../organisms/discovery/public-discover/public-discover";
import { makeMockPublicDiscoverProps } from "../../organisms/discovery/public-discover/public-discover.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Discover
        </h1>
      ),
      pageBody: (
        <div className="space-y-8">
          <DiscoveryFilterPanelPresentational
            {...makeMockDiscoveryFilterPanelProps()}
          />
          <PublicDiscoverPresentational {...makeMockPublicDiscoverProps()} />
          <DiscoveryMapPresentational {...makeMockDiscoveryMapProps()} />
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Discovery / Discover",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
