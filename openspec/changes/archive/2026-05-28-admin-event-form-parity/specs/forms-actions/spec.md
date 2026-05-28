## ADDED Requirements

### Requirement: Admin Event Form Parity
The admin event creation and editing form SHALL include configurable controls for event categories, ticket types, language selection, target age groups, and location fields, and forward these values to the save action.

#### Scenario: Admin configures and saves voucher event
- **WHEN** an admin creates or edits an event selecting a specific category (e.g. Kultur, Theater, etc.), ticket type "Promo Code" (VOUCHER), enters promo code, website URL, selects target age groups and languages, inputs neighborhood and address, and submits the form
- **THEN** the form reads these inputs from FormData and calls the saveEvent action with the dynamic payload including the configured category, voucher ticket type, promoCode, eventWebsiteUrl, ageGroups, languages, neighborhood, and address.

#### Scenario: Admin configures and saves secret code event
- **WHEN** an admin selects ticket type "Workaround Password" (SECRET_CODE), enters secret code and secret code mode, and submits the form
- **THEN** the form reads these inputs from FormData and calls the saveEvent action with the dynamic payload containing secretCodeMode and secretCode.
