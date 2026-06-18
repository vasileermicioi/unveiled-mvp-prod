## REMOVED Requirements

### Requirement: The replica is Ladle-only

**Reason:** The Mantine replica under `src/components/ui/mantine-replica/` is being deleted and replaced by the HeroUI replica under `src/components/ui/heroui-replica/`.

**Migration:** Ladle-only isolation is now enforced by `src/components/ui/heroui-replica/` and the `heroui-design-system-replica:check` script.

### Requirement: The replica covers every surface in the inventory

**Reason:** Inventory coverage is moving from Mantine wrappers (`Mantine<Name>.tsx`) to HeroUI wrappers (`Hero<Name>.tsx`).

**Migration:** Maintain the inventory at `.development-plan/11-iteration/features/improvements/heroui-design-system-replica/INVENTORY.md` and require a `Hero<Name>.tsx` plus `Hero<Name>.ladle.tsx` for each proved primitive.

### Requirement: The look and feel matches the production surface

**Reason:** The Mantine look-and-feel baseline is retired in favor of the HeroUI baseline.

**Migration:** Brand-backdrop and coverage requirements now apply to `Hero<Name>.ladle.tsx` stories and are gated by `bun run ladle:coverage`.

### Requirement: The brand tokens drive the theme

**Reason:** Theme generation moves from Mantine's theme object to the HeroUI / Tailwind theme in `src/components/ui/heroui-replica/theme.ts`.

**Migration:** Wire every color, typography, radius, border, shadow, and motion token from `design-tokens.json` into the HeroUI theme; hex-literal enforcement now applies to `src/components/ui/heroui-replica/`.

### Requirement: The design-system overview is the Ladle landing page

**Reason:** The Mantine overview page is deleted and replaced by a HeroUI overview page.

**Migration:** Use `src/components/ui/heroui-replica/design-system-overview.ladle.tsx` with the heading "Unveiled Design System (HeroUI)".
