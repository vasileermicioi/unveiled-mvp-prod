## REMOVED Requirements

### Requirement: Design System Replica Capability

**Reason**: The temporary `design-system-replica` capability existed to
scaffold a Ladle-only replica of the production component library so the
HeroUI migration could be iterated against a stable visual contract.
Now that the production primitives under `src/components/ui/` are
HeroUI-backed and the gherkin/Ladle parity suite, visual baselines, and
canonical docs all reference the production library, the replica
capability is retired.

**Migration**: All replica-only references in
`AGENTS.md`, `docs/guidelines.md`, `CONTRIBUTING.md`, the gherkin
parity suite, the Ladle coverage gate, the LikeC4 architecture model,
and the active OpenSpec changes are removed or rewritten to point at
the production HeroUI primitives under `src/components/ui/`. The
`src/components/ui/heroui-replica/` folder (and any remaining
`mantine-replica/` folder) is removed from the production tree once
the umbrella changes `heroui-ladle-design-system` and
`replace-shadcn-with-heroui` are archived.