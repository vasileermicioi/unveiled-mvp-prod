import {
  PartnerPortalFiltersPresentational,
  PartnerPortalHeaderPresentational,
  PartnerPortalListPresentational,
} from "./partner-portal";
import {
  makeMockPartnerPortalFiltersProps,
  makeMockPartnerPortalHeaderProps,
  makeMockPartnerPortalListProps,
} from "./partner-portal.mock";

export const HeaderDefault = () => (
  <PartnerPortalHeaderPresentational {...makeMockPartnerPortalHeaderProps()} />
);

export const HeaderWithQr = () => (
  <PartnerPortalHeaderPresentational
    {...makeMockPartnerPortalHeaderProps({
      venueQrUrl: "https://unveiled.app/checkin/donau115?token=abc",
    })}
  />
);

export const HeaderNoAddress = () => (
  <PartnerPortalHeaderPresentational
    {...makeMockPartnerPortalHeaderProps({ partnerAddress: null })}
  />
);

export const FiltersDefault = () => (
  <PartnerPortalFiltersPresentational
    {...makeMockPartnerPortalFiltersProps()}
  />
);

export const FiltersFilled = () => (
  <PartnerPortalFiltersPresentational
    {...makeMockPartnerPortalFiltersProps({
      searchValue: "Pat",
      eventFilter: "evt-1",
    })}
  />
);

export const ListDefault = () => (
  <PartnerPortalListPresentational {...makeMockPartnerPortalListProps()} />
);

export const ListEmpty = () => (
  <PartnerPortalListPresentational
    {...makeMockPartnerPortalListProps({ rows: [] })}
  />
);

export const ListLoading = () => (
  <PartnerPortalListPresentational
    {...makeMockPartnerPortalListProps({
      isLoading: true,
      rows: [],
    })}
  />
);

export const ListError = () => (
  <PartnerPortalListPresentational
    {...makeMockPartnerPortalListProps({
      isError: true,
      rows: [],
    })}
  />
);

export default {
  title: "Organisms / Partner Portal",
  parameters: { ladle: { skipCoverage: true } },
};
