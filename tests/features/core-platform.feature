Feature: Core Platform E2E Verification

  Scenario: Switching language translates layout elements
    Given I am on the landing page
    When I click the "EN" language toggle
    Then the page URL should contain "/en"
    And the page text should contain "Culture before it goes public."

  Scenario: Authenticated user redirects to member dashboard
    Given I am on the landing page
    When I fill "parity.member.active@example.test" in the field nearest to "Email"
    And I fill "Parity-Regression-2026!" in the field nearest to "Password"
    And I click the button with text "Login"
    Then the page URL should contain "/app"
    And the page text should contain "Today in Berlin."

  Scenario: Unauthenticated users are redirected to landing page
    Given I am on the landing page
    When I navigate to "/en/bookings"
    Then the page URL should be "/en/"
    And the page text should contain "Welcome back"

  Scenario: Active member successfully books an event
    Given I am logged in as a "member"
    When I click the "Book now" button on the event card with ID "secret"
    Then the booking modal header should contain "Parity Secret Access"
    When I click the button with text "Confirm access"
    Then the booking transaction should be successful
    And the modal should present a unique redemption code

  Scenario: Booking success screen enables calendar download
    Given I am logged in as a "member"
    When I click the "Book now" button on the event card with ID "secret"
    Then the booking modal header should contain "Parity Secret Access"
    When I click the button with text "Confirm access"
    Then the booking transaction should be successful
    And the modal should display a calendar download button
    When I click the calendar download button
    Then the page text should contain "Booking success"

  Scenario: Venue partner performs check-in status verification
    Given I am logged in as a "partner"
    When I navigate to "/en/venue-check-in/parity-partner-venue?token=PARITY-VENUE-CHECK-IN"
    And a partner registers check-in for a member booking
    Then the check-in status should update successfully

  Scenario: Admin views paginated event, partner, and member records
    Given I am logged in as a "admin"
    When I click the admin tab "events"
    Then the list page details should contain "Parity Public Opening"
    When I click the admin tab "members"
    Then the list page details should contain "parity.member.frozen@example.test"

  @mobile
  Scenario: Menu collapses on mobile viewport
    Given I am logged in as a "member"
    When I click the mobile menu button
    Then the navigation drawer should open
