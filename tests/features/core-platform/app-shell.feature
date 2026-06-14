Feature: App shell
  The app shell covers the sticky header, primary navigation, mobile drawer,
  and the language toggle that prefixes every route with the active language.

  Background:
    Given the user is logged in as Guest

  Scenario: Header shows the logo and language toggle
    When the user navigates to /en/
    Then the user asserts the header shows "Unveiled"
    And the user asserts the header shows "EN"

  Scenario: Mobile drawer opens from the menu control
    When the user navigates to /en/
    And the user toggles Menu
    Then the user asserts the nav shows "Discover"
    And the user asserts the nav shows "Membership"

  Scenario: Language toggle updates the URL prefix
    When the user navigates to /en/
    And the user switches the language to de
    Then the user asserts the active language is de
