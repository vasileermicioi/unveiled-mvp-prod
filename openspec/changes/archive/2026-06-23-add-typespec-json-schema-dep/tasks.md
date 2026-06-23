## 1. Declare the missing TypeSpec library

- [ ] 1.1 Add `"@typespec/json-schema": "^1.13.0"` to the root `package.json` `devDependencies`, alphabetically grouped with the existing `@typespec/*` packages.
- [ ] 1.2 Run `bun install` at the repo root and confirm the install succeeds and `bun.lock` now resolves `@typespec/json-schema`.

## 2. Verify the TypeSpec contract gate

- [ ] 2.1 Run `bun run specs:check` and confirm `tsp compile` reports zero errors (and specifically zero `import-not-found` errors).
- [ ] 2.2 Run `bun run specs:gen` and confirm the emitter regenerates `typespec/output/openapi.yaml` (and the re-exported validators module, if changed) without errors.

## 3. Run the umbrella gate

- [ ] 3.1 Run `bun run check` and confirm it passes end-to-end (Biome, `astro check`, `specs:check`, `tokens:check`, `ladle:coverage`, `wrangler:check`, `arch:check`).

## 4. Finalize the change

- [ ] 4.1 Commit `package.json`, `bun.lock`, and any regenerated artifacts under `typespec/output/**` and `src/lib/generated/**` in a single commit so reviewers see the install + regen together.
- [ ] 4.2 Run `openspec validate add-typespec-json-schema-dep` and confirm it exits zero.
- [ ] 4.3 Hand off to a human reviewer; do not self-merge.