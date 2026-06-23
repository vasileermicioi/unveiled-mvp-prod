## MODIFIED Requirements

### Requirement: `@unveiled/design-system` exposes the production UI primitives

The package's main entry (`packages/design-system/src/index.ts`) MUST re-export every production primitive that previously lived under `src/components/ui/` (`Button`, `Panel`, `Card`, `Badge`, `StatPanel`, `Divider`, `StatePanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `Notification`, `Skeleton`, `SafeImage`, `UnveiledPrimitives`), preserving their public prop surface and HeroUI-backed implementation.

The `TextInput` primitive MUST render the design-system 4px solid `unveiled-brand-dark` border defined by `design-tokens.json:258-272`. It MUST use HeroUI `variant="flat"` and its `inputWrapper` className MUST include all three of `!border-4`, `!border-solid`, and `!border-brand-dark` (border width, border style, and border color — all three are required for the border to render).

#### Scenario: All production primitives are re-exported

- **WHEN** a downstream package (e.g. `@unveiled/app`, `@unveiled/landing`) imports a production primitive from `@unveiled/design-system`
- **THEN** the import resolves to a module under `packages/design-system/src/` that composes the same HeroUI component the previous `src/components/ui/<primitive>.tsx` file composed
- **AND** the public prop surface (`variant`, `size`, `tone`, `shadow`, `interactive`, `state`, `loading`, `asChild`, `open`, `onClose`, `title`, `label`, `hint`, `error`, `value`, `onChange`, `disabled`, …) is preserved exactly.

#### Scenario: No legacy alias remains for the old location

- **WHEN** the repo is searched for a non-test, non-doc file that imports a primitive from `@/components/ui/`
- **THEN** zero hits are returned (the legacy `@/components/ui/...` alias is removed by change 04; until then, no production file may import a primitive that has been moved into the package).

#### Scenario: TextInput renders the design-system border

- **WHEN** `packages/design-system/src/unveiled-primitives.tsx` is inspected at the `TextInput` definition
- **THEN** HeroUI `Input` is rendered with `variant="flat"`
- **AND** the `inputWrapper` className contains `!border-4`, `!border-solid`, and `!border-brand-dark` (in that order or any order — all three required)
- **AND** the rendered DOM in any consumer (e.g. `packages/app/src/components/unveiled/auth/LoginForm.tsx`) shows a visible 4px solid `unveiled-brand-dark` border around the input.

#### Scenario: SelectInput and TextArea retain HeroUI bordered variant

- **WHEN** `packages/design-system/src/unveiled-primitives.tsx` is inspected at the `SelectInput` and `TextArea` definitions
- **THEN** both continue to use HeroUI `variant="bordered"` and do NOT carry the `!border-4 !border-solid !border-brand-dark` triple (HeroUI renders their borders natively).