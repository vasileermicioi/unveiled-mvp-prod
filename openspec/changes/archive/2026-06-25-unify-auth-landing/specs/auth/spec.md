## ADDED Requirements

### Requirement: Auth Landing Form Has A Single Source Of Truth

The auth landing form SHALL expose login, signup, and password-recovery
as modes of a single form surface, and SHALL offer a one-click switch
between them. When an authenticated viewer requests `/login` or
`/signup`, the page MUST server-side redirect to the role-appropriate
product surface (`/app/<lang>/app`, `/app/<lang>/admin`,
`/app/<lang>/partner`) within the same render pass; no client-side
flicker of the auth form SHALL be visible. The `/login` and `/signup`
URLs MUST remain routable for deep links but render the unified form.

#### Scenario: Signup form links to login

- **WHEN** the auth landing form is in `signup` mode
- **THEN** the form renders an "Already a member? Log in" link
- **AND** clicking the link flips the form into `login` mode without a
  page navigation

#### Scenario: Login form links to signup

- **WHEN** the auth landing form is in `login` mode
- **THEN** the form renders a "Become a member" link
- **AND** clicking the link flips the form into `signup` mode without a
  page navigation

#### Scenario: Signed-in visitor is redirected from /login and /signup

- **WHEN** an authenticated viewer requests `/login` or `/signup`
- **THEN** the page server-side redirects to the role-appropriate
  product surface (`/app/<lang>/app`, `/app/<lang>/admin`,
  `/app/<lang>/partner`) within the same render pass
- **AND** no client-side flicker of the auth form is visible