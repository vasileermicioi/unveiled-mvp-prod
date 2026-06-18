## 1. Add new production primitives for previously shimmed surfaces

- [x] 1.1 Add `src/components/ui/modal.tsx` backed by HeroUI's `Modal` with the existing `open` / `onClose` / `title` / `children` prop surface.
- [x] 1.2 Add `src/components/ui/drawer.tsx` backed by HeroUI's `Drawer` with the same prop surface.
- [x] 1.3 Add `src/components/ui/tabs.tsx` backed by HeroUI's `Tabs` and migrate the relevant call sites in the same commit.
- [x] 1.4 Add `src/components/ui/menu.tsx` backed by HeroUI's `Menu` and migrate the relevant call sites in the same commit.
- [x] 1.5 Add `src/components/ui/toast.tsx` backed by HeroUI's toast/notification API and migrate the relevant call sites in the same commit.
- [x] 1.6 Run `bun run check`, the matching Ladle stories, and the matching gherkin scenarios after each primitive lands.
