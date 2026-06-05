import { useEffect, useState } from "react";
import {
  Field,
  Panel,
  SelectInput,
  TextInput,
} from "@/components/ui/unveiled-primitives";
import type { DiscoveryFilters } from "@/lib/data-access/query-keys";
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
      <Field label={copy.startDate}>
        <TextInput
          type="date"
          value={filters.startDate ?? ""}
          onChange={(event) => updateFilter({ startDate: event.target.value })}
        />
      </Field>
      <Field label={copy.endDate}>
        <TextInput
          type="date"
          value={filters.endDate ?? ""}
          onChange={(event) => updateFilter({ endDate: event.target.value })}
        />
      </Field>
      <Field label={copy.category}>
        <SelectInput
          value={filters.category ?? ""}
          onChange={(event) => updateFilter({ category: event.target.value })}
        >
          <option value="">{copy.allCategories}</option>
          {live.publicCategories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label={copy.partner}>
        <SelectInput
          value={filters.partnerId ?? ""}
          onChange={(event) => updateFilter({ partnerId: event.target.value })}
        >
          <option value="">{copy.allPartners}</option>
          {live.publicPartnerOptions.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </SelectInput>
      </Field>
    </Panel>
  );
}
