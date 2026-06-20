Feature: Storybook runner
  The storybook runner opens a Storybook iframe from a tagged Gherkin
  scenario and re-issues the same step dispatcher against it. The
  scenarios below cover the happy path (tagged scenario opens the
  iframe and dispatches the step) and the opt-out path (a sibling
  story carries `parameters.storybook.skipCoverage = true` so the
  coverage script does not flag it as unreferenced).

  Background:
    Given the user is logged in as Guest

  @story(component=SmokeButton, story=Default)
  Scenario: Tagged scenario opens the Storybook iframe
    When the user navigates to /app/en/
    And the user asserts the page shows the heading "Upcoming"

  Scenario: Opt-out story is allowed
    Given the user is logged in as Member
    When the user navigates to /app/en/app
    Then the user asserts the page shows the heading "Upcoming"
