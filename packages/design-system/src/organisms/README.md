# `organisms/` — domain-organised layer

Organisms are recognisable, self-contained UI sections that compose
molecules (and atoms) into product-surface chunks. Every organism in
this layer is split into:

- a **presentational** component (`<Organism>Presentational`) — props
  only, no data hooks, no `useEffect`, no `fetch`, no `authClient`,
  no server actions;
- a **container** in `packages/app/src/components/unveiled/` or
  `packages/landing/src/components/landing/` — wires the data hooks
  and re-exports the presentational piece under the original name.

## Domain folder rules

- `organisms/<domain>/` MAY import only from:
  - `../../atoms/...` (production atoms),
  - `../../molecules/...` (production molecules),
  - `../../lib/...` (shared design-system utilities),
  - `../../styles/generated/tokens.css` (design tokens),
  - `react`, `react-dom`, and other framework primitives,
  - `../_shared/...` (cross-domain pieces).
- `organisms/<domain>/` MUST NOT import from:
  - `@nextui-org/react`, `@heroui/*`, or any other `@nextui-org/*`
    package (`R-ORGANISMS-NO-HEROUI`),
  - `lucide-react` or any other third-party icon package
    (`R-ORGANISMS-NO-LUCIDE`),
  - `./<other-domain>/...` — cross-domain coupling is forbidden; if
    two domains share a chunk, that chunk moves to `_shared/`
    (`R-ORGANISMS-NO-CROSS-DOMAIN`),
  - any other third-party UI library (the design system has no
    third-party UI dependencies).
- Every organism folder MUST ship a `<organism>.tsx`, a
  `<organism>.types.ts` (when prop types are non-trivial), a
  `<organism>.mock.ts`, and a `<organism>.ladle.tsx`
  (`R-ORGANISMS-HAS-STORY`).

## Domain folders

| Folder | Surface |
| --- | --- |
| `_shared/` | Cross-domain pieces (`LoadingSkeleton`, `EmptyState`, `ErrorState`, `PageHeader`, `PageShell`, …) |
| `shell/` | App shell, shell icons, mobile drawer |
| `auth/` | `LoginForm`, `SignupForm`, `PasswordRecoveryForm`, `LogoutFlow`, `BetterAuthErrorMessagesLocalized` |
| `discovery/` | `PublicDiscover`, `DiscoveryFilterPanel`, `DiscoveryMap` |
| `members/` | `MemberFeed` and its sub-sections |
| `bookings/` | `BookingModal` and its sub-sections |
| `admin/` | `AdminPanel` and its sub-sections |
| `partner-portal/` | `PartnerPortal` and its sub-sections |
| `payments/` | Stripe + credit-ledger payment organisms |
| `landing/` | `landing-header`, `landing-hero`, `landing-footer` |
| `__overview__/` | `Organisms / Overview` Ladle story (utility, not an organism) |

The `__overview__/` folder is exempt from the companion-file rule.