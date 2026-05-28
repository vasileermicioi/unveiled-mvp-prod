## Context

Currently, the admin dashboard fetches the full contents of user profiles (members registry), partner venues, and events from the database in a single query. On larger production datasets, this will cause slow response times, memory exhaustion, and sluggish DOM rendering. We need limit/offset pagination on both the database/server layer and the React user interface.

## Goals / Non-Goals

**Goals:**
- Implement limit/offset pagination in database queries for users/members, partners, and events.
- Update server actions and query endpoints to accept pagination parameters (`page`, `pageSize`) and return items alongside pagination metadata (`totalCount`, `hasMore`).
- Add index definitions on frequently sorted/filtered columns to optimize query execution plans.
- Create reusable, premium pagination controls in the React frontend.

**Non-Goals:**
- Pagination of public landmark searches (covered by distance/geospatial boundaries).
- Infinite scroll hydration (offset/page navigation is preferred for administrative tables).

## Decisions

### 1. Database Indexing
- **Decision:** Declare indexes on `user_profiles(last_name)`, `partners(name)`, and verify existing indexes on `bookings(created_at)`.
- **Rationale:** Prevents full-table scans when ordering or filtering list queries by name or date.

### 2. Limit/Offset API Schema
- **Decision:** Modify pagination query parameters to use standard 1-based `page` and `pageSize` on the frontend/actions, translating to SQL `limit` and `offset` internally.
- **Rationale:** 1-based page numbers are more intuitive for frontend routes and components.
- **Action Schema:**
  ```typescript
  const paginationSchema = z.object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().default(20),
  });
  ```

### 3. Unified Pagination Component
- **Decision:** Build a custom, high-contrast pagination control component matching the theme.
- **Rationale:** Reusable styling ensures visual parity and consistent user interaction patterns across the Admin tabs.

## Risks / Trade-offs

- **Risk:** Inefficient `COUNT(*)` queries on extremely large tables during total count checks.
  - **Mitigation:** In the future, count caches or estimation functions can be introduced if table sizes grow beyond millions. For current MVP scale, Drizzle `count()` with indexed keys is highly performant.
