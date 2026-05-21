## Legacy Sources

- `_old_app/translations.ts`: Shared DE/EN dictionary for shell labels, booking CTAs, onboarding labels, auth labels, checkout, redemption, admin, and partner labels.
- `_old_app/App.tsx`: Route-level public/member copy, language switching, booking status state, membership gate messages, and venue/auth state copy.
- `_old_app/components/*.tsx`: Surface-specific copy for event cards/maps, auth, onboarding, bookings, profile, partner portal, and admin operations.

## Migrated Surfaces

- Shell: `src/lib/auth-display.ts`, `src/components/unveiled/app-shell.tsx`.
- Public/member UI: `src/components/unveiled/visual-system-app.tsx`.
- Display data: `src/lib/data-access/mappers.ts`, `src/lib/data-access/live-view-adapters.ts`, `src/lib/data-access/repositories.ts`.
- Auth/profile persistence: `src/lib/auth-profile.ts`, `src/actions/index.ts`.
- Parity coverage: `tests/parity/public-member.spec.ts`, data-access/auth unit tests.

## Copy Mapping

- Shell/navigation: legacy `mySaves`, `myBookings`, `credits`, auth/login/membership labels -> migrated shell nav items, profile/logout controls, credits badge, guest primary actions.
- Event discovery/card copy: legacy `filters`, `available`, `waitlist`, `saveThis`, `savedThis`, `bookNow`, `joinWaitlist` -> migrated discovery shell, event card labels, public/member empty states, map actions.
- Booking modal/outcomes: legacy `tickets`, `total`, `processing`, `confirmBooking`, `bookingSuccess`, `waitlistSuccess`, `redemption.ticketCode`, `redemption.secretDesc` -> migrated booking modal success, waitlist, failure, copy, calendar, and close actions.
- Auth/public pages: legacy `auth` and checkout copy -> migrated landing auth form, membership page, public route landmarks, validation/notice text.
- Onboarding/profile/bookings: legacy onboarding labels plus profile/bookings component strings -> migrated onboarding, profile forms, bookings, ledger, and support panels.

## Intentional English-Only Scope

- Admin-only operational labels and form controls stay English unless they already have direct legacy translated equivalents.
- Partner/admin export filenames and internal status/debug messages stay English.
- Product/entity data such as event titles, partner names, addresses, categories, and seeded fixture names are not translated.
