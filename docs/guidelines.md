# Unveiled MVP Coding & Styling Guidelines

> **Canonical entrypoint:** [`AGENTS.md`](../AGENTS.md) is the first doc every
> contributor (human or agent) reads. It points here for the detailed style
> rules and to the other long-form docs (`docs/architecture.md`,
> `openspec/specs/`, `.development-plan/0N-iteration/`). This file is the
> source of truth for the rules summarized in §4 of `AGENTS.md`; update
> `AGENTS.md` first if the stack or iteration cycle changes.

This document specifies the code standards, architecture requirements, styling principles, and automated verification rules for Unveiled MVP. All contributors (humans and agents) must adhere to these guidelines.

---

## 1. TypeScript & Code Conventions

The workspace enforces strict TypeScript checks.

### Strict Type Compliance
* Always specify types for arguments and complex structures. Avoid `any` except where absolutely necessary and accompanied by a comment.
* The workspace extends `astro/tsconfigs/strict`. TypeScript validation is run pre-commit as part of build and check runs.
* Do not bypass TypeScript compiler checks (e.g., using `// @ts-ignore` or `// @ts-nocheck` unless explicitly approved with comments justifying the bypass).

### Code Structure
* **File Naming**: Use `kebab-case` for directory structures, scripts, and non-component source files (e.g. `query-layer.ts`, `auth.ts`).
* **Component Naming**: Use `kebab-case` for Astro components (e.g. `base-layout.astro`, `event-card.astro`) and `PascalCase` for React components/islands (e.g. `BookingModal.tsx`).
* **Import Aliasing**: Use the standard path prefix `@/` to import files from the `src/` directory (e.g. `import { db } from "@/db/client";`).

---

## 2. Astro Layout & Component Structure

Astro serves as our primary SSR framework.

### Layout Principles
* Layout files must reside in `src/layouts/`.
* Every page should wrap its contents in a base layout (such as [base-layout.astro](file:///root/dev/deepcode/unveiled-mvp-prod/src/layouts/base-layout.astro)).
* Base layouts are responsible for injecting `global.css`, parsing page metadata (title, SEO description), setting language attributes on the `<html>` element, and rendering children using `<slot />`.

Example Layout Core Structure:
```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  lang?: string;
}

const { title, lang = "en" } = Astro.props;
---
<html lang={lang.toLowerCase()}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Component Boundaries
* **Server-Only Content**: Keep business logic, database queries, and private key operations in server-rendered Astro components.
* **Client Islands**: Use React components ONLY when interactive states, modals, or client-side context (like TanStack Query caching) are required. Use appropriate hydration directives (e.g., `client:load`, `client:only="react"`).

---

## 3. Styling & Custom CSS Conventions

We utilize **Tailwind CSS v4** combined with custom utility tokens in `src/styles/global.css`.

### Design Tokens Source of Truth

All design tokens (colors, typography, spacing, radii, borders, shadows, motion, breakpoints, z-index) are defined once in [`design-tokens.json`](file:///root/dev/deepcode/unveiled-mvp-prod/design-tokens.json) in W3C DTCG format. The values are generated into CSS custom properties under [`src/styles/generated/tokens.css`](file:///root/dev/deepcode/unveiled-mvp-prod/src/styles/generated/tokens.css) (auto-generated, do not edit by hand) and exposed as typed TypeScript enums under [`src/lib/design-tokens.ts`](file:///root/dev/deepcode/unveiled-mvp-prod/src/lib/design-tokens.ts).

**To add, remove, or rename a design token:**

1. Edit `design-tokens.json`.
2. Run `bun run tokens:gen` to regenerate the CSS and types.
3. Run `bun run tokens:check` (or `bun run check`, which includes it) to verify drift is zero.

Do not transcribe hex values, pixel sizes, or font names in component code. Reference tokens by name (`var(--brand-yellow)`, `BrandColor.BrandYellow`, `Radius.Md`, etc.) so a single JSON edit propagates everywhere.

### Brand Color System
Never use generic Tailwind color classes (like `bg-red-500` or `text-blue-600`) unless mapping directly to functional alerts. Use our brand custom properties, which resolve to the values declared in `design-tokens.json`:
* `--brand-yellow` (`color.brand.yellow`) - Background brand color
* `--brand-cream` (`color.brand.cream`) - Secondary lighter surface color
* `--brand-grey` (`color.brand.grey`) - Default background base
* `--brand-dark` (`color.brand.dark`) - Default text, borders, and dark backgrounds
* `--brand-white` (`color.brand.white`) - Card panels and modals background
* `--brand-error` (`color.brand.error`) - Destructive action color
* `--brand-success` (`color.brand.success`) - Positive confirmation color

### Typography System
* **Display Font**: Use the `font-display` utility class or display elements (`h1`, `h2`, `h3`). It resolves to the `typography.font-family.display` token. These headers must always be uppercase.
* **Body Font**: Defaults to `font-sans`, which resolves to the `typography.font-family.body` token.

### Borders & Shadows
Our aesthetic utilizes a high-contrast layout with bold borders and offset block shadows:
* **Borders**: Use `.unveiled-border` (resolved from `border.unveiled` / `border.unveiled-lg` tokens; 3 px on mobile, 4 px on desktop) to enclose components and panels.
* **Shadows**: Use `.unveiled-shadow` (resolved from `shadow.unveiled` / `shadow.unveiled-lg` tokens; 6 px on mobile, 12 px on desktop).
* **Hover Transitions**: For interactive cards, apply `.unveiled-card-hover` to transition shadow and translate positions smoothly on hover using the `motion.transition.card-hover` token.

Example Class Combination:
```html
<div class="bg-white unveiled-border unveiled-shadow unveiled-card-hover p-6">
  <h3 class="font-display text-xl">Event Title</h3>
  <p class="font-sans text-muted-foreground mt-2">Description goes here.</p>
</div>
```

---

## 4. Biome Linting & Formatting

The repository configures [Biome](https://biomejs.dev/) to format and lint code files.

### Biome Constraints
* **Indentation Style**: 2 spaces (no tabs).
* **JavaScript Formatter**: Double quotes (`"`) for strings, trailing commas (`"all"`), and semicolons (`always`).
* **Linter**: Standard recommended rules are active.
* **Astro Exception**: Note that linting is disabled for `.astro` template contents within `biome.json` to prevent parsing conflicts. Astro validation is performed via `astro check`.

---

## 5. Automated Verification

Before staging or committing any code changes to the repository, all compliance checks must pass.

### Execution Command
Run the following script command:
```sh
bun run check
```
This executes two steps internally:
1. `astro check` - Validates type-safety and Astro template structure.
2. `biome check .` - Lints and formats all supported JavaScript, TypeScript, and CSS files.
