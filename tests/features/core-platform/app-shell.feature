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

  Scenario: Hamburger disclosure announces its open state
    When the user navigates to /en/
    Then the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with aria-expanded="false"
    And the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with aria-label="Open navigation menu"

  Scenario: Mobile drawer opens as a modal dialog
    When the user navigates to /en/
    And the user activates the disclosure in nav
    Then the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with aria-expanded="true"
    And the user asserts nav exposes #shell-mobile-drawer with role="dialog"
    And the user asserts nav exposes #shell-mobile-drawer with aria-modal="true"
    And the user asserts nav exposes #shell-mobile-drawer with aria-labelledby="shell-mobile-drawer-heading"

  Scenario: Mobile drawer closes via the localized close control
    When the user navigates to /en/
    And the user activates the disclosure in nav
    And the user dismisses nav via the close control
    Then the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with aria-expanded="false"

  Scenario: Language toggle exposes aria-pressed for the active option
    When the user navigates to /en/
    Then the user asserts nav exposes [role="group"][aria-label="Language"] button[aria-pressed="true"] with aria-pressed="true"
    And the user asserts nav exposes [role="group"][aria-label="Language"] button[aria-pressed="false"] with aria-pressed="false"

  Scenario: Hamburger aria-label follows the active language
    When the user navigates to /en/
    Then the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with aria-label="Open navigation menu"
    When the user navigates to /de/
    Then the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with aria-label="Navigationsmenü öffnen"
