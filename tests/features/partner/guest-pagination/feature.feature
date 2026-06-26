Feature: Partner portal guest list pagination + already-used row
  The partner portal guest list paginates at pageSize=20 with a
  configurable page-size dropdown, and rows whose booking status is
  `USED` render an "Already used" badge with a disabled check-in
  button.

  Background:
    Given the pagination dataset is seeded with "bun run seed:pagination"

  @seed(profile=pagination,reset=true)
  @ladle(component=PartnerGuestPagination, story=DefaultPage)
  Scenario: Partner walks the guest list to the next page
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner
    And the user clicks the "Next page" button
    Then the API Worker received "?partnerGuestsPage=2&partnerGuestsPageSize=20"
    And the user asserts the section shows "Guest"

  @seed(profile=pagination,reset=true)
  @ladle(component=PartnerGuestPagination, story=AlreadyUsed)
  Scenario: Already-used row renders the badge and disables the check-in button
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner
    Then the user asserts the section shows "Already used"
    And the user asserts the check-in button is disabled for booking "used-booking-1"

  @ladle(component=PartnerGuestPagination, story=PageSizeChange)
  Scenario: Changing the page size resets the page to 1
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner
    And the user selects the page size "50"
    Then the API Worker received "?partnerGuestsPage=1&partnerGuestsPageSize=50"