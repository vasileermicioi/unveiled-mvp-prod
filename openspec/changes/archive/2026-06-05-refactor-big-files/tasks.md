## 1. Context Provider Setup

- [x] 1.1 Create `src/components/unveiled/context.tsx` and define common interfaces, shared state, and hooks (`useLiveData`, `useCopy`)

## 2. Extract Modular Subcomponents

- [x] 2.1 Extract and create `src/components/unveiled/BookingModal.tsx`
- [x] 2.2 Extract and create `src/components/unveiled/DiscoveryFilterPanel.tsx`
- [x] 2.3 Extract and create `src/components/unveiled/PublicDiscover.tsx`
- [x] 2.4 Extract and create `src/components/unveiled/MemberFeed.tsx`
- [x] 2.5 Extract and create `src/components/unveiled/PartnerPortal.tsx`
- [x] 2.6 Extract and create `src/components/unveiled/AdminPanel.tsx`

## 3. VisualSystemApp Refactoring

- [x] 3.1 Refactor `src/components/unveiled/visual-system-app.tsx` to wrap components in the provider and render imported modules

## 4. Verification

- [x] 4.1 Execute `bun run check` to verify compilation and formatting
- [x] 4.2 Execute `bun run test:parity` to verify regression test parity
