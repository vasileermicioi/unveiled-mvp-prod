import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import {
  PartnerPortalFiltersPresentational,
  PartnerPortalHeaderPresentational,
  PartnerPortalListPresentational,
} from "../../organisms/partner-portal/partner-portal/partner-portal";
import {
  makeMockPartnerPortalFiltersProps,
  makeMockPartnerPortalHeaderProps,
  makeMockPartnerPortalListProps,
} from "../../organisms/partner-portal/partner-portal/partner-portal.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageBody: (
        <div className="space-y-8">
          <PartnerPortalHeaderPresentational
            {...makeMockPartnerPortalHeaderProps()}
          />
          <PartnerPortalFiltersPresentational
            {...makeMockPartnerPortalFiltersProps()}
          />
          <PartnerPortalListPresentational
            {...makeMockPartnerPortalListProps()}
          />
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Partner / Partner portal",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
