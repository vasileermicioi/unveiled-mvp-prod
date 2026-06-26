Feature: Partner portal check-in failure surfaces per-row
  A check-in mutation that fails (booking already used, partner does
  not own the event, or the booking is in `CANCELLED_PENDING`) MUST
  surface the failure as a per-row `ShellStatusBanner` keyed by the
  row's `bookingId` without affecting any other row. The banner is
  dismissed on the next successful refetch of the partner guest list.

  Background:
    Given the pagination dataset is seeded with "bun run seed:pagination"

  @seed(profile=pagination,reset=true)
  @ladle(component=PartnerCheckInFailure, story=NoBanner)
  Scenario: No banner is rendered on a healthy guest list
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner
    Then the user asserts no ShellStatusBanner is visible

  @seed(profile=pagination,reset=true)
  @ladle(component=PartnerCheckInFailure, story=ErrorBanner)
  Scenario: Per-row error banner is rendered after a failed check-in
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner
    And the user clicks the check-in button for booking "cancelled-booking-1"
    Then the user asserts the row shows a ShellStatusBanner with type="error"
    And the user asserts other rows render normally

  @seed(profile=pagination,reset=true)
  @ladle(component=PartnerCheckInFailure, story=CancelledBooking)
  Scenario: Cancelled booking surfaces a per-row error banner
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner
    And the user clicks the check-in button for booking "cancelled-booking-1"
    Then the user asserts the row shows a ShellStatusBanner with type="error"

  @seed(profile=pagination,reset=true)
  @ladle(component=PartnerCheckInFailure, story=ClearedAfterRefetch)
  Scenario: Per-row banner is cleared after a successful refetch
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner
    And the user clicks the check-in button for booking "cancelled-booking-1"
    And the partner guest list refreshes successfully
    Then the user asserts no ShellStatusBanner is visible for that row