## ADDED Requirements

### Requirement: Complete Onboarding Form Preferences
The onboarding form SHALL capture and forward all selected profile preferences, including interests, moods, districts, max distance, timing, days, preferred languages, age group, and accessibility toggles, to the save onboarding server action.

#### Scenario: Member submits complete onboarding preferences wizard
- **WHEN** an authenticated member completes all steps of the onboarding wizard and submits the form
- **THEN** the onboarding form forwards the actual selected wizard choices to the save onboarding action rather than using hardcoded values
