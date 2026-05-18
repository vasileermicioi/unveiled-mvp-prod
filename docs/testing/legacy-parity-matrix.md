# Legacy Parity Regression Matrix

This matrix maps the visible OpenSpec parity requirements to the automated suite introduced by `add-legacy-parity-regression-suite`.

## Route Smoke

| Surface | Expected coverage | Test owner |
| --- | --- | --- |
| `/` | Landing auth form, guest sign-in affordance, no demo-only labels | `tests/parity/public-member.spec.ts` |
| `/discover` | Seeded event title, partner, date, capacity, CTA | `tests/parity/public-member.spec.ts` |
| `/how-it-works` | Public landmark copy | `tests/parity/public-member.spec.ts` |
| `/membership` | Membership heading and plan details | `tests/parity/public-member.spec.ts` |
| `/faq` | FAQ landmark copy | `tests/parity/public-member.spec.ts` |
| `/app` | Member-only redirect plus seeded event visibility | `tests/parity/public-member.spec.ts` |
| `/saved` | Member-only redirect plus seeded saved event visibility | `tests/parity/public-member.spec.ts` |
| `/bookings` | Member-only redirect plus seeded booking code visibility | `tests/parity/public-member.spec.ts` |
| `/profile` | Member-only redirect plus seeded profile identity visibility | `tests/parity/public-member.spec.ts` |
| `/partner` | Partner-only redirect plus guest list visibility | `tests/parity/operations.spec.ts` |
| `/admin` | Admin-only redirect plus operations rows visibility | `tests/parity/operations.spec.ts` |
| `/venue-check-in/[partnerId]?token=...` | Guest sign-in gate and authenticated venue check-in landmark | `tests/parity/operations.spec.ts` |

## Contract And Action Coverage

| Requirement area | Expected coverage | Test owner |
| --- | --- | --- |
| Protected route ownership | Guest/member/partner/admin redirects and callback-aware venue QR continuation | `src/lib/product-routes.test.ts`, `src/lib/parity-route-auth.test.ts` |
| Authorized seeded loaders | Member/partner/admin route loaders remain role-scoped | `src/lib/data-access/query-layer.test.ts`, `src/lib/parity-data-access.integration.test.ts` |
| Demo-fixture absence | Known demo labels stay out of seeded production routes | `src/lib/parity-fixtures.test.ts`, `tests/parity/*.spec.ts` |
| Booking and waitlist parity | Confirmed, used, sold-out, waitlist, voucher, and secret-code outcomes | `src/lib/booking-transactions.integration.test.ts`, `src/lib/parity-actions.integration.test.ts` |
| Member actions | Save/unsave, profile, preferences, onboarding invalidation and authorization | `src/lib/parity-actions.integration.test.ts` |
| Partner/admin operations | Check-in, event, partner, member mutation results and refresh scope | `src/lib/parity-actions.integration.test.ts` |

## Environment Assumptions

- `PARITY_TEST_DATABASE_URL` points to a dedicated Postgres database for seeded parity tests.
- `BETTER_AUTH_SECRET` and auth URL variables are configured so seeded login flows can create sessions.
- Playwright smoke tests reuse the same seeded database and local Astro dev server.

## Known Gaps

- Browser screenshots are intentionally out of scope.
- Smoke coverage focuses on route-level landmarks and seeded field visibility, not pixel parity.
