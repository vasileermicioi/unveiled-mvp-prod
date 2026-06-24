import type { ChangeEvent, ReactElement } from "react";
import { TextInput } from "../../../atoms/text-input";
import { Field, SelectInput } from "../../../molecules";

export interface DiscoveryFilterPanelProps {
  formId: string;
  landmarkLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  categoryLabel: string;
  partnerLabel: string;
  allCategoriesLabel: string;
  allPartnersLabel: string;
  startDate: string;
  endDate: string;
  category: string;
  partnerId: string;
  categories: string[];
  partners: { id: string; name: string }[];
  onFilterChange: (patch: {
    startDate?: string;
    endDate?: string;
    category?: string;
    partnerId?: string;
  }) => void;
}

export function DiscoveryFilterPanelPresentational(
  props: DiscoveryFilterPanelProps,
): ReactElement {
  const {
    formId,
    landmarkLabel,
    startDateLabel,
    endDateLabel,
    categoryLabel,
    partnerLabel,
    allCategoriesLabel,
    allPartnersLabel,
    startDate,
    endDate,
    category,
    partnerId,
    categories,
    partners,
    onFilterChange,
  } = props;
  return (
    <section className="grid gap-4 p-4 md:grid-cols-4 border-4 border-brand-dark bg-white">
      <form
        id={formId}
        aria-labelledby={`${formId}-heading`}
        onSubmit={(event: React.FormEvent<HTMLFormElement>) =>
          event.preventDefault()
        }
        className="contents"
      >
        <h2 id={`${formId}-heading`} className="sr-only">
          {landmarkLabel}
        </h2>
        <Field label={startDateLabel} htmlFor="discover-filter-start-date">
          <TextInput
            id="discover-filter-start-date"
            type="date"
            value={startDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onFilterChange({ startDate: event.target.value })
            }
          />
        </Field>
        <Field label={endDateLabel} htmlFor="discover-filter-end-date">
          <TextInput
            id="discover-filter-end-date"
            type="date"
            value={endDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onFilterChange({ endDate: event.target.value })
            }
          />
        </Field>
        <Field label={categoryLabel} htmlFor="discover-filter-category">
          <SelectInput
            id="discover-filter-category"
            value={category}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              onFilterChange({ category: event.target.value })
            }
          >
            <option value="">{allCategoriesLabel}</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label={partnerLabel} htmlFor="discover-filter-partner">
          <SelectInput
            id="discover-filter-partner"
            value={partnerId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              onFilterChange({ partnerId: event.target.value })
            }
          >
            <option value="">{allPartnersLabel}</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectInput>
        </Field>
      </form>
    </section>
  );
}
