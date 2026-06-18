## 1. Add the HeroUIProvider module

- [x] 1.1 Add `src/components/providers/heroui-provider.tsx` exporting a client component that wraps children in `HeroUIProvider` and applies the theme from `@/lib/heroui-theme`.

## 2. Mount HeroUIProvider from the app shell

- [x] 2.1 Mount `HeroUIProvider` from `src/components/unveiled/app-shell.tsx` so every island inherits the provider.
- [x] 2.2 Audit every island that wraps a HeroUI client-only surface and gate it with `client:only="react"` (or a `useEffect`-gated dynamic import).
- [x] 2.3 Run `bun run build` to confirm SSR on Cloudflare Workers does not crash.
- [x] 2.4 Run `bun run check` to confirm the provider mount is non-breaking.
