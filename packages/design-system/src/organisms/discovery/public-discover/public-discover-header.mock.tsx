import type { PublicDiscoverHeaderProps } from "./public-discover-header";

export function makeMockPublicDiscoverHeaderProps(
  overrides: Partial<PublicDiscoverHeaderProps> = {},
): PublicDiscoverHeaderProps {
  return {
    eyebrow: "Included with membership",
    title: "Curated cultural access in Berlin",
    body: "Become a member to unlock partner-quiet invitations to Berlin's most interesting live events. No queue. No algorithm.",
    ...overrides,
  };
}
