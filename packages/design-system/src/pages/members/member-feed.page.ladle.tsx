import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import {
  MemberFeedGatePresentational,
  MemberFeedHeaderPresentational,
} from "../../organisms/members/member-feed/member-feed-header";
import {
  makeMockMemberFeedGateProps,
  makeMockMemberFeedHeaderProps,
} from "../../organisms/members/member-feed/member-feed-header.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageBody: (
        <div className="space-y-6">
          <MemberFeedHeaderPresentational
            {...makeMockMemberFeedHeaderProps()}
          />
          <MemberFeedGatePresentational {...makeMockMemberFeedGateProps()} />
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Members / Member feed",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
