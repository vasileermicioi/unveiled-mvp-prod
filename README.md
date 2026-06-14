# Unveiled MVP

Astro SSR web app for live-event discovery, booking, and member management.

> **New here?** Read [`AGENTS.md`](./AGENTS.md) for the tech stack, file
> layout, conventions, and the iteration loop. Humans should also read
> [`CONTRIBUTING.md`](./CONTRIBUTING.md) for PR, review, and release
> specifics.

## Quickstart

```sh
bun install
bun run dev
```

`bun run check` runs the full lint + type-check + contract + tokens gate;
`bun run build` produces the Cloudflare Workers bundle. Copy `.env.example`
to `.env` for local values; the local DB lives at `./.data/pglite`.
