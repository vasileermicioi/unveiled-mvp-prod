## ADDED Requirements

### Requirement: Umbrella Verification And Archival

The umbrella change `replace-shadcn-with-heroui` SHALL pass its full check matrix end-to-end, and SHALL be archived via `openspec archive` once the PR merges. The umbrella's `proposal.md` SHALL be updated (or superseded) if any public prop signature changed during slices 2d, 2e, or 2f.

#### Scenario: Full check matrix is green

- **WHEN** `bun run check`, `bun run check:heroui-replica`, `bun run test:e2e`, `bun run test:ladle`, and `bun run build` are run
- **THEN** every command exits 0
- **AND** the production bundle is within the existing performance budget

#### Scenario: Umbrella proposal is updated if a prop signature changed

- **WHEN** slices 2d, 2e, or 2f shipped a public prop signature change
- **THEN** the umbrella's `proposal.md` records the change
- **AND** `openspec validate replace-shadcn-with-heroui` passes after the update

#### Scenario: Umbrella is archived after merge

- **WHEN** the umbrella's PR merges to main
- **THEN** `openspec archive replace-shadcn-with-heroui` moves the change to `openspec/changes/archive/<date>-replace-shadcn-with-heroui/`

> The capability deltas for `app-shell` and `ui-system` are owned by earlier slices and the umbrella `replace-shadcn-with-heroui`. This slice is the closing gate.

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
