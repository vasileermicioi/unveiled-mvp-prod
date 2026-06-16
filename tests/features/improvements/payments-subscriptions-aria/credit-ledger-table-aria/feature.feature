Feature: Credit ledger view is a single accessible region
  The credit ledger on the member feed renders inside a single
  table region with a screen-reader-friendly caption, scoped
  column headers, and stable row anchors, so gherkin can target
  rows through proximity+layout selectors and screen readers
  announce it as a single ledger region.

  @story(component=CreditLedgerViewTableSemantics, story=PopulatedTableIsARegion)
  Scenario: Member views a populated credit ledger and the table region is reachable
    Given the user is logged in as Member
    When the user navigates to /en/app
    Then the user asserts a region named "Credit ledger" is reachable
    And the user asserts a table named "Credit ledger" inside the region is reachable
    And the user asserts the table has column headers "Reason", "Date", "Actor", "Credits"

  @story(component=CreditLedgerViewTableSemantics, story=EmptyLedgerKeepsRegion)
  Scenario: Empty credit ledger still exposes the region landmark with the empty-state copy
    Given the user is logged in as Member
    And the credit ledger has no entries
    When the user navigates to /en/app
    Then the user asserts a region named "Credit ledger" is reachable
    And the user asserts the region exposes the empty-state copy "The credit ledger is empty."
