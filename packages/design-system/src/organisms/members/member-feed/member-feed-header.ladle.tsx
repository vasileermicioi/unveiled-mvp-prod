import {
  MemberFeedGatePresentational,
  MemberFeedHeaderPresentational,
  MemberFeedMessagePresentational,
} from "./member-feed-header";
import {
  makeMockMemberFeedGateProps,
  makeMockMemberFeedHeaderProps,
  makeMockMemberFeedMessageProps,
} from "./member-feed-header.mock";

export const HeaderDefault = () => (
  <MemberFeedHeaderPresentational {...makeMockMemberFeedHeaderProps()} />
);

export const GateDefault = () => (
  <MemberFeedGatePresentational {...makeMockMemberFeedGateProps()} />
);

export const MessageDefault = () => (
  <MemberFeedMessagePresentational {...makeMockMemberFeedMessageProps()} />
);

export const MessageEmpty = () => (
  <MemberFeedMessagePresentational
    {...makeMockMemberFeedMessageProps({ message: "" })}
  />
);

export default {
  title: "Organisms / Members / Member Feed",
  parameters: { ladle: { skipCoverage: true } },
};
