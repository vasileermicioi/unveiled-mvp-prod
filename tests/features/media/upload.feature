Feature: Media upload
  Media upload covers the R2 storage boundary and the SafeImage
  component that renders the uploaded URL.

  Background:
    Given the user is logged in as Admin

  Scenario: Admin uploads an event image
    When the user navigates to /app/en/admin/events
    And the user submits upload with File=event.png
    Then the user asserts the section shows "Uploaded"
