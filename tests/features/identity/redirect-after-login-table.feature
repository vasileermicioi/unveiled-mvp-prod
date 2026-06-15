Feature: Redirect-after-login table
  When an authenticated viewer lands on a route their surface does
  not own, the middleware consults the typed
  `redirectAfterLoginFor` table and redirects to the safe
  per-surface destination. The table is the only place cross-surface
  fallback destinations are computed and is exercised by gherkin
  + storybook coverage for every cell.

  @story(component=RedirectAfterLoginTable, story=MemberAdmin)
  Scenario: Member on admin route is redirected to the member safe destination
    Given the user is logged in as Member
    When the user navigates to /en/admin
    Then the user asserts the redirect-after-login table shows the cell "USER × admin" pointing at the member safe destination

  @story(component=RedirectAfterLoginTable, story=PartnerAdmin)
  Scenario: Partner on admin route is redirected to the partner safe destination
    Given the user is logged in as Partner
    When the user navigates to /en/admin
    Then the user asserts the redirect-after-login table shows the cell "PARTNER × admin" pointing at the partner safe destination
