Feature: Modal primitive parity
  The production `Modal` primitive in `src/components/ui/modal.tsx`
  SHALL expose the focus trap, `aria-modal`, `aria-labelledby`, and
  close-on-escape behavior, and SHALL render the booking modal as a
  full-screen brand-yellow shell. Each scenario is wired into the
  Ladle coverage gate via the co-located `Modal.ladle.tsx` harness.

  Background:
    Given the user is logged in as Member

  @ladle(component=Modal, story=OpenWithTitle)
  Scenario: Modal opens with the title as the labelledby target
    When the user navigates to /app/en/
    Then the dialog named "Confirm booking" is reachable
    And the dialog named "Confirm booking" exposes aria-modal "true"
    And the dialog named "Confirm booking" exposes aria-labelledby pointing at "Confirm booking"

  @ladle(component=Modal, story=BookingShell)
  Scenario: Booking modal renders the full-screen brand-yellow shell
    When the user navigates to /app/en/app
    Then the dialog named "Book event" is reachable
    And the dialog named "Book event" exposes the brand-yellow surface

  @ladle(component=Modal, story=CloseOnEscape)
  Scenario: Modal closes when Escape is pressed
    When the user navigates to /app/en/
    And the user dismisses the dialog named "Confirm booking" with Escape
    Then the dialog named "Confirm booking" is not reachable