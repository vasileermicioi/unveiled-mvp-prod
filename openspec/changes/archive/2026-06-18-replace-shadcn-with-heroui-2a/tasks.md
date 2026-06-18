## 1. Promote HeroUI to production dependencies

- [x] 1.1 Move `@nextui-org/react` from `devDependencies` to `dependencies` in `package.json`.
- [x] 1.2 Run `bun install` and commit the regenerated `bun.lock`.
- [x] 1.3 Run `bun run check` and `bun run ladle:coverage` to confirm the dependency move alone is non-breaking.
