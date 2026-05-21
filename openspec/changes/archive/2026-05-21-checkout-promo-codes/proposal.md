## Why

During membership checkout, users can type a promo code into the checkout form. However, the `onClick` handler of the checkout button calls `actions.updateMembership` with a hardcoded `promoCode: ""` parameter. This prevents promo codes from ever being applied at registration.

## What Changes

- Introduce a local component state variable for the promo code (e.g., `checkoutPromoCode`) in the checkout step Panel inside `visual-system-app.tsx`.
- Bind the checkout promo code `TextInput` to `checkoutPromoCode` (using `value` and `onChange`).
- Update the `actions.updateMembership` call inside the continue button's onClick event to pass `promoCode: checkoutPromoCode` instead of the empty string.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `forms-actions`: Forward user-entered promo code from the registration/checkout UI panel to the membership server action.

## Impact

- `src/components/unveiled/visual-system-app.tsx`: Declare `checkoutPromoCode` state, bind it to the TextInput, and pass it to the checkout action call.
