Feature: Toast and Notification primitive parity
  The production `Toast` primitive in `src/components/ui/toast.tsx`
  SHALL expose `role="status"` / `role="alert"`, an `aria-live`
  region, and an auto-dismiss timer. Each scenario is wired into the
  Ladle coverage gate via the co-located `Toast.ladle.tsx` harness.

  Background:
    Given the user is logged in as Member

  @ladle(component=Toast, story=SuccessTone)
  Scenario: Success toast announces itself inside the live region
    When the user navigates to /app/en/app
    And the user triggers the success toast "Saved"
    Then the status named "Saved" is reachable
    And the status named "Saved" lives inside an aria-live polite region

  @ladle(component=Toast, story=ErrorTone)
  Scenario: Error toast announces itself inside the live region with role alert
    When the user navigates to /app/en/app
    And the user triggers the error toast "Booking failed"
    Then the alert named "Booking failed" is reachable
    And the alert named "Booking failed" lives inside an aria-live assertive region