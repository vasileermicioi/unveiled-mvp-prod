Feature: Admin tabs render loading skeletons and surface fetch errors
  Admin operations tabs MUST render a deterministic loading skeleton on
  first paint and MUST surface API errors as a `ShellStatusBanner`
  with a retry action.

  Background:
    Given the user is logged in as Admin

  @ladle(component=TableSkeleton, story=Default)
  Scenario: First paint renders a loading skeleton
    When the user navigates to /app/en/admin/events
    Then the user asserts the section shows "Loading admin events"

  @ladle(component=TableSkeleton, story=Dense)
  Scenario: Compact loading skeleton renders on a dense tab
    When the user navigates to /app/en/admin/partners
    Then the user asserts the section shows "Loading admin partners"