## Context

Currently, the public discovery page (`PublicDiscover`) and member discovery page (`MemberFeed`) display lists of events. The repository loads events using a pagination page size of 6, but we lack consistent controls and synchronization behavior. When filters change, the page parameter is not always reset to page 1 (`undefined`), and the member discovery feed does not render pagination controls at the bottom of its event grid.

## Goals / Non-Goals

**Goals:**
- **Instant Filter Updates**: Trigger query refetch as soon as category, partner, or date range inputs change.
- **Pagination Reset**: Automatically reset the pagination page parameter to `undefined` (page 1) when any search filter changes.
- **Limit/Offset Pagination**: Display at most 6 events per page on discovery surfaces.
- **Pagination Controls**: Add Previous/Next pagination buttons with page indicators at the bottom of both `PublicDiscover` and `MemberFeed` event grids if total items exceed the page size.
- **Disabled Bounds**: Disable the "Previous" button on page 1, and the "Next" button when `hasMore` is false.

**Non-Goals:**
- Admin panel pagination changes or infinite scrolling are out of scope.

## Decisions

### 1. Robust Page Reset in Filter Updates
We will wrap `setDiscoveryFilters` in `VisualSystemProvider` to automatically reset the `page` parameter to `undefined` whenever any search filter (`category`, `partnerId`, `startDate`, `endDate`) changes:
```typescript
const setDiscoveryFiltersWrapped = (value: React.SetStateAction<DiscoveryFilters>) => {
  setDiscoveryFilters((prev) => {
    const next = typeof value === "function" ? value(prev) : value;
    const hasFilterChanged =
      next.category !== prev.category ||
      next.partnerId !== prev.partnerId ||
      next.startDate !== prev.startDate ||
      next.endDate !== prev.endDate;
    if (hasFilterChanged) {
      return { ...next, page: undefined };
    }
    return next;
  });
};
```
This centralizes the page reset logic, making it robust against any component-level update.

### 2. Pagination Rendering in public & member feeds
Both `PublicDiscover` and `MemberFeed` will render pagination controls below their respective event grids. We will conditionally show these controls when `totalCount` exceeds `pageSize` (e.g. `live.totalCount > live.pageSize`).

## Risks / Trade-offs

- **[Risk]** Quick filter changes might trigger excessive query requests.
  - **Mitigation** React Query's built-in query caching and request deduplication will minimize unnecessary server requests. In addition, tracking events are already debounced via a timer in `context.tsx`.
