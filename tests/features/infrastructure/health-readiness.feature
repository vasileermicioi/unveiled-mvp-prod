Feature: Health and readiness
  Health and readiness cover the public probes exposed under
  /api/health.json and /api/readiness.json.

  Background:
    Given the user is logged in as Guest

  Scenario: Health probe returns a 200
    When the user waits for /api/health.json to complete
    Then the user asserts the response is 200

  Scenario: Readiness probe returns a 200 once the database is reachable
    When the user waits for /api/readiness.json to complete
    Then the user asserts the response is 200
