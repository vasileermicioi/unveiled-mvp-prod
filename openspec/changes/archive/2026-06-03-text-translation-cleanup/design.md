## Context

The application currently handles localization via client-side state/cookies and maps pages directly under the root `src/pages/` directory (e.g., `/discover`, `/app`, `/admin`). For production parity, the active language (`de` or `en`) must be represented directly in the URL path (e.g., `/de/discover` or `/en/discover`) to allow bookmarking, SEO benefits, and clean user sharing. Additionally, the change must guarantee that all validation schema messages, operational confirmation modals, and actions are completely localized without hardcoded string leaks.

## Goals / Non-Goals

**Goals:**
- Migrate all Astro routes under a `[lang]` dynamic parameter structure (`src/pages/[lang]/...`).
- Implement automatic redirection from `/` to the correct default or user-preferred subroute (`/en/` or `/de/`) based on cookies/headers.
- Implement a route-preserving language switcher in the navbar that retains the page's current subpath and search queries when switching languages.
- Translate all form validation schemas, server response envelopes, and deletion/warning confirmation modals.

**Non-Goals:**
- Localizing the database schema or data records.
- Altering the core authentication workflows or session database models of Better Auth.

## Decisions

### 1. Astro File-Based Routing with `[lang]` Prefix
We will group page templates under a `src/pages/[lang]/` directory.
- *Alternatives Considered*: Standard static folders (`/de/` and `/en/`) vs a dynamic `[lang]` route.
- *Rationale*: A dynamic parameter folder `[lang]` allows us to compile or dynamically generate routes in Astro efficiently, reducing code duplication.

### 2. Root Redirect Logic
The main entry point at `/src/pages/index.astro` will serve as the root redirector.
- *Alternatives Considered*: Astro middleware redirect vs root page redirect.
- *Rationale*: A root page redirect allows simple server-side detection of the `unveiled_lang` cookie or browser `Accept-Language` header and issues a standard HTTP redirect immediately to the active language base route.

### 3. Route-Preserving Language Switcher
The language toggle component inside the navbar will dynamically swap the route prefix:
- *Mechanism*: Extract `window.location` path, replace the starting `/de` or `/en` segment with the target language, append query parameters, and execute navigation.

### 4. Schema and Modal i18n
All validation messages in Zod schemas will call parameterized translation helpers from `src/lib/i18n.ts` instead of static English copy. Modals will bind text from localized `appCopy` keyed on the current route language.

## Risks / Trade-offs

- **[Risk] Deep link 404 errors for un-prefixed URLs**  
  → **Mitigation**: Standardize all application link generation to prepend `/[lang]`. Configure a fallback redirect if the URL lacks a valid language prefix.
- **[Risk] Better Auth authentication redirect overrides**  
  → **Mitigation**: Set the `unveiled_lang` cookie upon locale changes, so authorization endpoints/callbacks can read the cookie to redirect back to the correct localized route.
