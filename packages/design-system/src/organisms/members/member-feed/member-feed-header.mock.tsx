import type {
  MemberFeedGateProps,
  MemberFeedHeaderProps,
  MemberFeedMessageProps,
} from "./member-feed-header";

export function makeMockMemberFeedHeaderProps(
  overrides: Partial<MemberFeedHeaderProps> = {},
): MemberFeedHeaderProps {
  return {
    badge: "Member feed",
    title: "What's on this week",
    ...overrides,
  };
}

export function makeMockMemberFeedGateProps(
  overrides: Partial<MemberFeedGateProps> = {},
): MemberFeedGateProps {
  return {
    membershipGate: "Membership paused",
    billingGate: "Renew to resume weekly invitations.",
    ...overrides,
  };
}

export function makeMockMemberFeedMessageProps(
  overrides: Partial<MemberFeedMessageProps> = {},
): MemberFeedMessageProps {
  return {
    message: "Event saved",
    ...overrides,
  };
}
