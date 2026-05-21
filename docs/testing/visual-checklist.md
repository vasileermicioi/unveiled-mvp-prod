# Legacy Visual Parity Manual Review Checklist

This checklist outlines the interactive elements, hover states, transitions, and dynamic user interfaces that cannot be fully or reliably verified via automated visual regression tests. Conduct these checks manually on both **desktop** and **mobile** screen viewports to ensure visual parity with `_old_app`.

---

## 1. Global Navigation and Layout

- [ ] **Interactive Hover States**:
  - Hovering over navigation links ("Discover", "How it works", "Membership", "FAQ") should trigger smooth color/underline transitions identical to the legacy app.
- [ ] **Mobile Menu (Hamburger) Transitions**:
  - Open the mobile menu and verify slide-in transitions and absolute alignment of links.
  - Test opening and closing rapidly to verify menu container stabilization.
- [ ] **Bilingual Language Switcher (DE/EN)**:
  - Toggle between English and German.
  - Verify that the layout shifts smoothly, button active states swap correctly, and that text length differences do not cause layout breaks.

---

## 2. Forms, Modals and Inputs

- [ ] **Focus Ring and Borders**:
  - Focus inputs on the Login and Signup modals (e.g., Email, Password, Name).
  - Verify the thick border rhythm, shadow changes, and outline color match the legacy specifications.
- [ ] **Validation Flash Alerts**:
  - Submit forms with invalid data to trigger error states.
  - Verify the color, padding, and font styling of alert boxes.
- [ ] **Modal Backdrop and Exit Behavior**:
  - Trigger the Login, Signup, and Booking modals.
  - Verify background backdrop blur/opacity, opening animation scale-ins, and that clicking the close button (`X`) or backdrop behaves smoothly.

---

## 3. Cards & Lists (Discover / App)

- [ ] **Card Hover Effects**:
  - Hover over event cards on public `/discover` and member `/app` pages.
  - Verify transform shifts, border shadow offsets, and button color transitions.
- [ ] **Empty States & Loading Skeletors**:
  - Simulate loading or empty filters (e.g., search with random letters).
  - Verify the appearance, styling, and alignment of empty status indicators.

---

## 4. Bookings & Profile Interactions

- [ ] **Click-to-Copy Flash Animation**:
  - Click the "Copy code" button on a ticket booking card.
  - Verify that the label instantly updates to "Copied" and displays the checkmark icon, then reverts smoothly.
- [ ] **Stripe Mock Interfaces**:
  - Select Credit Card and SEPA payment options in the Member Profile.
  - Verify that the mock payment panel mounts below the option seamlessly, displaying correct background color tones.

---

## 5. Map Panel Transitions

- [ ] **Map View Sliding / Draggability**:
  - Click "Explore map" to slide open the map panel.
  - Drag the map tile viewport and zoom in/out via control buttons.
  - Verify map marker placement and selection previews match legacy styling.
