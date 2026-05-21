## ADDED Requirements

### Requirement: Member Checkout Form Promo Code
The checkout form SHALL forward the user-entered promo code when initiating a membership update or registration.

#### Scenario: Member submits promo code at checkout
- **WHEN** a user enters a promo code in the checkout form and clicks continue
- **THEN** the checkout button action submits the typed promo code value to the update membership server action
