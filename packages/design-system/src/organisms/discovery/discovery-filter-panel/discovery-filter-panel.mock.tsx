import type { DiscoveryFilterPanelProps } from "./discovery-filter-panel";

export function makeMockDiscoveryFilterPanelProps(
  overrides: Partial<DiscoveryFilterPanelProps> = {},
): DiscoveryFilterPanelProps {
  return {
    formId: "discovery-filter-panel-mock",
    landmarkLabel: "Filter discover results",
    startDateLabel: "Start date",
    endDateLabel: "End date",
    categoryLabel: "Category",
    partnerLabel: "Partner",
    allCategoriesLabel: "All categories",
    allPartnersLabel: "All partners",
    startDate: "",
    endDate: "",
    category: "",
    partnerId: "",
    categories: ["Music", "Art", "Talk"],
    partners: [
      { id: "p1", name: "Donau115" },
      { id: "p2", name: "SchwuZ" },
    ],
    onFilterChange: () => undefined,
    ...overrides,
  };
}
