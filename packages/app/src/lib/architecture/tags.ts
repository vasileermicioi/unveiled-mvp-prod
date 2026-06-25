// Closed-enum tag values used by the LikeC4 model.
//
// This file is the canonical source of truth for the tag values the
// `likec4-architecture` model may use. The unit test in
// `tests/architecture/model-tags.test.ts` asserts that every element in the
// model carries one tag from each of the enums below.
//
// Adding a new value requires:
//   1. Adding it to the relevant enum in this file
//   2. Adding the corresponding `tag <prefix> { <value> { ... } }` block in
//      `architecture/specification.likec4` (currently `tag <prefix>` is
//      declared as a free-form tag — promote it to a closed enum if the
//      project needs stricter checks)
//   3. Using the new value on at least one model element in
//      `architecture/model.likec4` or `architecture/deployment.likec4`

export const SPEC_TAGS = [
  "likec4-architecture",
  "image-storage",
  "auth",
  "booking-transactions",
  "data-access",
  "deployment",
  "discover-filters-pagination",
  "display-data",
  "domain-data",
  "forms-actions",
  "jobs-notifications",
  "operations",
  "app-shell",
  "pages",
  "payments-subscriptions",
  "refactor-big-files",
  "ui-system",
  "design-system-package",
] as const;

export const SURFACE_TAGS = [
  "browser",
  "external",
  "system",
  "runtime",
  "data",
  "public-discover",
  "member-app",
  "admin-panel",
  "partner-portal",
  "deployment/local",
  "deployment/preview",
  "deployment/prod",
] as const;

export const ROLE_TAGS = [
  "actor",
  "process",
  "store",
  "external",
  "ui",
] as const;

export const DOMAIN_TAGS = [
  "discover",
  "bookings",
  "auth",
  "payments",
  "media",
  "forms",
  "data-access",
  "domain-data",
  "operations",
  "jobs",
  "notifications",
  "app-shell",
  "deployment",
  "pages",
  "ui-system",
  "refactor",
  "e2e",
  "display",
] as const;

export const REQUIRED_TAG_PREFIXES = [
  "spec",
  "surface",
  "role",
  "domain",
] as const;

export type SpecTag = (typeof SPEC_TAGS)[number];
export type SurfaceTag = (typeof SURFACE_TAGS)[number];
export type RoleTag = (typeof ROLE_TAGS)[number];
export type DomainTag = (typeof DOMAIN_TAGS)[number];
