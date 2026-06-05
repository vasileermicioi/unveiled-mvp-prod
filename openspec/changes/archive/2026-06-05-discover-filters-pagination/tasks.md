## 1. Filter State & Page Reset

- [x] 1.1 Intercept and wrap `setDiscoveryFilters` in `src/components/unveiled/context.tsx` to reset the `page` parameter to `undefined` if any search filters (`category`, `partnerId`, `startDate`, `endDate`) change.

## 2. Member Discovery Page Traversal

- [x] 2.1 Add pagination controls (Previous/Next buttons, page indicators) to the bottom of the event grid in `src/components/unveiled/MemberFeed.tsx`.
- [x] 2.2 Disable the Previous button on page 1 and the Next button when `hasMore` is false in both `PublicDiscover.tsx` and `MemberFeed.tsx`.

## 3. Verification & Testing

- [x] 3.1 Run tests and verify the UI behavior manually or using playwright to ensure filters reset the page and pagination traverse correctly.
