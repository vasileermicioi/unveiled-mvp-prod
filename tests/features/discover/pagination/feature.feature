Feature: Public discovery pagination
  The public discover surface paginates through the curated event
  feed via URL search params. The seeded pagination dataset has ≥11
  pages at `pageSize=6` so the Next/Previous controls are exercisable.
  Filter changes reset `page` to 1 and keep `pageSize`.

  Background:
    Given the pagination dataset is seeded with "bun run seed:pagination"

  @seed(profile=pagination,reset=true)
  @ladle(component=PublicDiscoverPagination, story=DeepLink)
  Scenario: Discover deep-link preserves page and page size
    Given the user is logged in as Guest
    When the user navigates to /app/en/discover?page=3&pageSize=24
    Then the URL contains "page=3"
    And the URL contains "pageSize=24"
    And the user asserts the page-size control shows "24"
    And the user asserts the pagination control shows page 3

  @seed(profile=pagination,reset=true)
  @ladle(component=PublicDiscoverPagination, story=Default)
  Scenario: Discover next page advances through the grid
    Given the user is logged in as Guest
    When the user navigates to /app/en/discover
    And the user clicks the "Next page" button
    Then the URL contains "page=2"
    And the response carries page=2

  @seed(profile=pagination,reset=true)
  @ladle(component=PublicDiscoverPagination, story=LastPage)
  Scenario: Discover next page is disabled at the last page
    Given the user is logged in as Guest
    When the user navigates to /app/en/discover?page=12&pageSize=6
    Then the "Next page" button is disabled