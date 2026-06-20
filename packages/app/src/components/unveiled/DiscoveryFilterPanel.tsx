import { useEffect, useState } from "react";
import { Field, Panel, SelectInput, TextInput } from "@unveiled/design-system";
import type { DiscoveryFilters } from "~/lib/data-access/query-keys";
import { useCopy, useLiveData } from "./context";

const SEARCH_LANDMARK_ID = "discover-filter-search";

export function DiscoveryFilterPanel() {
  const copy = useCopy().discovery;
  const live = useLiveData();
  const [filters, setFilters] = useState<DiscoveryFilters>(
    live.discoveryFilters,
  );

  useEffect(() => {
    setFilters(live.discoveryFilters);
  }, [live.discoveryFilters]);

  const updateFilter = (patch: DiscoveryFilters) => {
    const next = { ...filters, ...patch, page: undefined };
    setFilters(next);
    live.setDiscoveryFilters?.(next);
  };

  return (
    <Panel
      tone="white"
      shadow={false}
      className="grid gap-4 p-4 md:grid-cols-4"
    >
      <form
        role="search"
        id={SEARCH_LANDMARK_ID}
        aria-labelledby={`${SEARCH_LANDMARK_ID}-heading`}
        onSubmit={(event) => event.preventDefault()}
        className="contents"
      >
        <h2 id={`${SEARCH_LANDMARK_ID}-heading`} className="sr-only">
          {copy.filterLandmark}
        </h2>
        <Field label={copy.startDate} htmlFor="discover-filter-start-date">
          <TextInput
            id="discover-filter-start-date"
            type="date"
            value={filters.startDate ?? ""}
            onChange={(event) =>
              updateFilter({ startDate: event.target.value })
            }
          />
        </Field>
        <Field label={copy.endDate} htmlFor="discover-filter-end-date">
          <TextInput
            id="discover-filter-end-date"
            type="date"
            value={filters.endDate ?? ""}
            onChange={(event) => updateFilter({ endDate: event.target.value })}
          />
        </Field>
        <Field label={copy.category} htmlFor="discover-filter-category">
          <SelectInput
            id="discover-filter-category"
            value={filters.category ?? ""}
            onChange={(event) => updateFilter({ category: event.target.value })}
          >
            <option value="">{copy.allCategories}</option>
            {live.publicCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label={copy.partner} htmlFor="discover-filter-partner">
          <SelectInput
            id="discover-filter-partner"
            value={filters.partnerId ?? ""}
            onChange={(event) =>
              updateFilter({ partnerId: event.target.value })
            }
          >
            <option value="">{copy.allPartners}</option>
            {live.publicPartnerOptions.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </SelectInput>
        </Field>
      </form>
    </Panel>
  );
}
