import { DiscoveryFilterPanelPresentational } from "./discovery-filter-panel";
import { makeMockDiscoveryFilterPanelProps } from "./discovery-filter-panel.mock";

export const Default = () => (
  <DiscoveryFilterPanelPresentational
    {...makeMockDiscoveryFilterPanelProps()}
  />
);

export const Filled = () => (
  <DiscoveryFilterPanelPresentational
    {...makeMockDiscoveryFilterPanelProps({
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      category: "Music",
      partnerId: "p1",
    })}
  />
);

export const Empty = () => (
  <DiscoveryFilterPanelPresentational
    {...makeMockDiscoveryFilterPanelProps({
      categories: [],
      partners: [],
    })}
  />
);

export default {
  title: "Organisms / Discovery / Filter Panel",
  parameters: { ladle: { skipCoverage: true } },
};
