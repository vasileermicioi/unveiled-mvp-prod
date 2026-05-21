## 1. Local State Tracking

- [x] 1.1 Declare the `checkoutPromoCode` local state in the `MembershipPage` component inside `src/components/unveiled/visual-system-app.tsx`
- [x] 1.2 Bind the `value` and `onChange` attributes of the promo code `TextInput` to `checkoutPromoCode` state and its updater function

## 2. Server Action Parameter

- [x] 2.1 Update the checkout continue button's `onClick` handler to pass `promoCode: checkoutPromoCode` to the `actions.updateMembership` call
- [x] 2.2 Run automated regression tests to verify that the build compiles and all tests pass
