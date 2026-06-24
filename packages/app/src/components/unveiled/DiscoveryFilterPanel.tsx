import {
  DiscoveryFilterPanelPresentational,
  type DiscoveryFilterPanelProps,
} from "@unveiled/design-system";
import { useEffect, useState } from "react";
import type { DiscoveryFilters } from "~/lib/data-access/query-keys";
import { useCopy, useLiveData } from "./context";

export function DiscoveryFilterPanel() {
  const copy = useCopy().discovery;
  const live = useLiveData();
  const [filters, setFilters] = useState<DiscoveryFilters>(
    live.discoveryFilters,
  );

  useEffect(() => {
    setFilters(live.discoveryFilters);
  }, [live.discoveryFilters]);

  function applyFilter(patch: Partial<DiscoveryFilters>) {
    const next = { ...filters, ...patch, page: undefined };
    setFilters(next);
    live.setDiscoveryFilters?.(next);
  }

  const props: DiscoveryFilterPanelProps = {
    formId: "discover-filter-search",
    landmarkLabel: copy.filterLandmark,
    startDateLabel: copy.startDate,
    endDateLabel: copy.endDate,
    categoryLabel: copy.category,
    partnerLabel: copy.partner,
    allCategoriesLabel: copy.allCategories,
    allPartnersLabel: copy.allPartners,
    startDate: filters.startDate ?? "",
    endDate: filters.endDate ?? "",
    category: filters.category ?? "",
    partnerId: filters.partnerId ?? "",
    categories: live.publicCategories,
    partners: live.publicPartnerOptions,
    onFilterChange: applyFilter,
  };

  return <DiscoveryFilterPanelPresentational {...props} />;
}
