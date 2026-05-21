## Context

During membership checkout on the `MembershipPage` (rendered inside `src/components/unveiled/visual-system-app.tsx`), users can input a promo code. However, the continue/checkout button's `onClick` handler invokes `actions.updateMembership` with `promoCode` hardcoded to `""`. This design document specifies how we track the input value using local component state and forward it correctly.

## Goals / Non-Goals

**Goals:**
* Capture the user's promo code input in the checkout form.
* Pass the input promo code to the `actions.updateMembership` server action call.

**Non-Goals:**
* Changing the server-side action validation behavior for promo codes.
* Performing client-side lookup or validation of the promo code (this is handled on the backend/Stripe level).

## Decisions

### 1. Introduce local React state in `MembershipPage`
We will declare a local state variable `checkoutPromoCode` inside the `MembershipPage` component.

```tsx
const [checkoutPromoCode, setCheckoutPromoCode] = useState("");
```

### 2. Bind the promo code TextInput
We will bind the `TextInput` for the promo code to the new local state:

```tsx
<Field label={copy.promoCode}>
  <TextInput
    name="promoCode"
    placeholder={copy.optional}
    value={checkoutPromoCode}
    onChange={(e) => setCheckoutPromoCode(e.target.value)}
  />
</Field>
```

### 3. Forward the state to `actions.updateMembership`
We will update the `onClick` handler of the checkout button to pass the `checkoutPromoCode` value:

```tsx
onClick={() =>
  void runServerAction(
    () =>
      actions.updateMembership({
        paymentMethod: selectedPaymentMethod,
        promoCode: checkoutPromoCode,
        isFrozen: false,
        isActive:
          live.billingDisplay.subscriptionStatusLabel === "Active",
      }),
    setMessage,
    live.refetchActiveSurface,
  )
}
```

## Risks / Trade-offs

* **[Risk] State resets on layout unmount** → If the checkout component completely unmounts and remounts, the user's entered promo code will be reset.
  * *Mitigation:* The `MembershipPage` persists in the DOM while the user is actively filling out the checkout details, so unmounting mid-checkout is not a risk.
