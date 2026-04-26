## Legacy App Usage Scope

The legacy app in `_old_app/` is used only as a UI and data reference.

The new application must not preserve the old technical architecture.

The following legacy aspects are in scope:

- visual layout
- page structure
- component appearance
- spacing, typography, colors, icons, and responsive behavior
- visible user flows
- displayed data fields
- labels, copy, table columns, cards, forms, filters, and empty states

The following legacy aspects are out of scope:

- authentication implementation
- authorization implementation
- backend implementation
- database schema
- API structure
- routing internals
- state management
- framework-specific code
- build tooling
- deployment setup

The target app should look and behave like the old UI, but it should be implemented using the new stack and new architecture.

Data compatibility means preserving the data that is visible or required by the UI, not preserving the old database design.
