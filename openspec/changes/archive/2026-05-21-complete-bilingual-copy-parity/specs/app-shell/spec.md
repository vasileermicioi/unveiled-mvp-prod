## ADDED Requirements

### Requirement: Bilingual Shell Copy Parity
The app shell SHALL render legacy-equivalent German and English copy for shared navigation, language controls, status banners, and shell-level state wrappers.

#### Scenario: Guest shell language persists
- **WHEN** a guest switches between `DE` and `EN`
- **THEN** the navigation labels, public shell actions, and shell status messages render in the selected language
- **AND** the preference persists through the guest language cookie across reloads and public route navigation

#### Scenario: Authenticated shell language persists
- **WHEN** an authenticated viewer switches between `DE` and `EN`
- **THEN** member navigation labels, credits/saved/bookings/profile controls, and shell status messages render in the selected language
- **AND** the preference persists to the authenticated profile and is used by subsequent server-rendered shell hydration

#### Scenario: Shell wrappers use selected language
- **WHEN** shell-level loading, empty, error, frozen-account, or membership attention states are visible
- **THEN** their visible messages and action labels use the selected language without mixing stale copy from a previous language
