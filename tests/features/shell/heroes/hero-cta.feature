Feature: Hero CTA pair uses the secondary Button variant at size lg with the ArrowRight icon
  The hero section in `packages/app/src/components/unveiled/visual-system-app.tsx:167-178`
  SHALL render two CTAs ("EXPLORE ACCESS" and "HOW IT WORKS") that share the
  design-system `secondary` Button variant at `size="lg"`, and both SHALL
  carry an `ArrowRight` icon (lucide-react) as the trailing glyph. The
  `app-shell` capability spec codifies the styling contract; this feature
  locks the parity end-to-end through the Ladle harness.

  Background:
    Given the user is logged in as Guest

  @ladle(component=HeroCta, story=SecondaryLgPair)
  Scenario: Hero CTA pair renders the secondary lg class combination
    When the user navigates to /app/en/
    Then the main exposes a[data-slot="button"][href="/app/en/discover"] with class containing "bg-white"
    And the main exposes a[data-slot="button"][href="/app/en/discover"] with class containing "text-brand-dark"
    And the main exposes a[data-slot="button"][href="/app/en/discover"] with class containing "border-brand-dark"
    And the main exposes a[data-slot="button"][href="/app/en/discover"] with class containing "min-h-14"
    And the main exposes a[data-slot="button"][href="/app/en/discover"] with class containing "px-7"
    And the main exposes a[data-slot="button"][href="/app/en/discover"] with class containing "py-4"
    And the main exposes a[data-slot="button"][href="/app/en/discover"] with class containing "text-xs"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with class containing "bg-white"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with class containing "text-brand-dark"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with class containing "border-brand-dark"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with class containing "min-h-14"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with class containing "px-7"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with class containing "py-4"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with class containing "text-xs"

  @ladle(component=HeroCta, story=SecondaryLgPair)
  Scenario: Hero CTA pair renders the ArrowRight icon on both buttons
    When the user navigates to /app/en/
    Then the main exposes a[data-slot="button"][href="/app/en/discover"] svg with class containing "lucide-arrow-right"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] svg with class containing "lucide-arrow-right"

  @ladle(component=HeroCta, story=SecondaryLgPair)
  Scenario: Hero CTA pair navigates to the public app routes
    When the user navigates to /app/en/
    Then the main exposes a[data-slot="button"][href="/app/en/discover"] with href="/app/en/discover"
    And the main exposes a[data-slot="button"][href="/app/en/how-it-works"] with href="/app/en/how-it-works"
