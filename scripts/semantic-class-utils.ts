import { createHash } from "node:crypto";

export const CATALOGUE: Record<string, string> = {
  "min-h-screen flex flex-col bg-white text-brand-dark": "app-page",
  "flex flex-wrap items-center justify-between gap-4 p-4": "app-page-header",
  "flex flex-wrap gap-2": "app-page-toolbar",
  "mx-auto w-full max-w-6xl px-4 md:px-6": "content-shell",
  "page-shell min-h-screen text-brand-dark selection:bg-brand-dark selection:text-brand-yellow":
    "page-shell",
  "space-y-6": "form-shell",
  "grid min-h-screen place-items-center bg-brand-cream p-6": "auth-page",
  "w-full max-w-md space-y-6 border-4 border-brand-dark bg-white p-8 shadow-[6px_6px_0_0_#202621]":
    "auth-card",
  "space-y-4": "auth-stack",
  "grid gap-6 lg:grid-cols-[320px_1fr]": "discover-layout",
  "divide-y-2 divide-brand-dark/20": "member-feed-list",
  "grid gap-3 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-center":
    "member-feed-row",
  "grid gap-4 sm:grid-cols-2 lg:grid-cols-3": "admin-panel-grid",
  "space-y-3 border-b-2 border-brand-dark/20 pb-4": "admin-panel-section",
  "grid gap-3 sm:grid-cols-2 lg:grid-cols-4": "admin-panel-stats",
  "min-h-screen bg-brand-cream text-brand-dark": "landing-page",
  "mx-auto w-full max-w-5xl px-6 py-16": "landing-section",
  "grid gap-8 sm:grid-cols-3": "landing-footer-grid",
};

export const BESPOKE_COMPONENT_CLASSES = new Set([
  "unveiled-border",
  "unveiled-border-lg",
  "unveiled-shadow",
  "unveiled-shadow-lg",
  "unveiled-card-hover",
  "unveiled-meta",
  "headline-xl",
  "headline-lg",
  "headline-md",
  "headline-sm",
  "page-shell",
  "content-shell",
  "display-font",
  "grid-shell",
  ...Object.values(CATALOGUE),
]);

export const TW_ANIMATE_ELEMENT_CLASSES = new Set([
  "animate-in",
  "animate-out",
  "fade-in",
  "fade-out",
  "zoom-in",
  "zoom-out",
  "slide-in-from-top",
  "slide-in-from-bottom",
  "slide-in-from-left",
  "slide-in-from-right",
  "slide-out-to-top",
  "slide-out-to-bottom",
  "slide-out-to-left",
  "slide-out-to-right",
]);

export function isTwAnimateElementClass(token: string): boolean {
  if (TW_ANIMATE_ELEMENT_CLASSES.has(token)) {
    return true;
  }
  return /^(fade|zoom|slide)-(in|out)(-|$)/.test(token);
}

export function isBespokeComponentClass(token: string): boolean {
  return BESPOKE_COMPONENT_CLASSES.has(token);
}

export const COLOR_TOKEN_ALIASES: Record<string, string> = {
  "brand-destructive": "brand-error",
};

export function resolveColorTokenAlias(token: string): string {
  const opacityMatch = /^([^/]+)(\/\d+)$/.exec(token);
  if (opacityMatch) {
    const base = opacityMatch[1] ?? "";
    const suffix = opacityMatch[2] ?? "";
    const mapped = COLOR_TOKEN_ALIASES[base] ?? base;
    return `${mapped}${suffix}`;
  }
  return COLOR_TOKEN_ALIASES[token] ?? token;
}

export const ELEMENT_ONLY_CLASS_ALIASES: Record<string, string[]> = {
  "animate-fade-in": ["animate-in", "fade-in"],
};

export function expandElementOnlyAliases(tokens: string[]): string[] {
  const out: string[] = [];
  for (const token of tokens) {
    const alias = ELEMENT_ONLY_CLASS_ALIASES[token];
    if (alias) {
      out.push(...alias);
    } else {
      out.push(resolveColorTokenAlias(token));
    }
  }
  return out;
}

export function splitClassTokens(value: string): {
  bespoke: string[];
  utilities: string[];
} {
  const tokens = expandElementOnlyAliases(
    normalizeUtilityString(value).split(/\s+/).filter(Boolean),
  );
  const bespoke: string[] = [];
  const utilities: string[] = [];
  for (const token of tokens) {
    if (isBespokeComponentClass(token) || isTwAnimateElementClass(token)) {
      bespoke.push(token);
    } else if (isForbiddenToken(token)) {
      utilities.push(token);
    } else {
      bespoke.push(token);
    }
  }
  return { bespoke, utilities };
}

export function normalizeUtilityString(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function hashClassName(value: string): string {
  const digest = createHash("sha256").update(value).digest("hex").slice(0, 8);
  return `ui-${digest}`;
}

export function isForbiddenToken(token: string): boolean {
  if (!token) {
    return false;
  }
  if (token.includes("--")) {
    const base = token.split("--")[0] ?? token;
    if (
      Object.values(CATALOGUE).includes(base) ||
      /^ui-[a-f0-9]{8}$/.test(base) ||
      /^(unveiled-|headline-|page-shell|content-shell|display-font|grid-shell)/.test(
        base,
      )
    ) {
      return false;
    }
  }
  if (
    /^(unveiled-|headline-|page-shell|content-shell|display-font|grid-shell)/.test(
      token,
    )
  ) {
    return false;
  }
  if (/^ui-[a-f0-9]{8}$/.test(token)) {
    return false;
  }
  if (Object.values(CATALOGUE).includes(token)) {
    return false;
  }
  return (
    /^(grid|flex|inline-flex|block|hidden|contents|table|table-row|table-cell)$/.test(
      token,
    ) ||
    /^flex-/.test(token) ||
    /^(gap|space-[xy])-/.test(token) ||
    /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-/.test(token) ||
    /^(min|max)-[hw]-/.test(token) ||
    /^border(-|$)/.test(token) ||
    /^text-/.test(token) ||
    /^bg-/.test(token) ||
    /^rounded/.test(token) ||
    /^shadow/.test(token) ||
    /^(w|h|size)-/.test(token) ||
    /^divide-/.test(token) ||
    /^place-/.test(token) ||
    /^items-/.test(token) ||
    /^justify-/.test(token) ||
    /^self-/.test(token) ||
    /^col-/.test(token) ||
    /^row-/.test(token) ||
    /^order-/.test(token) ||
    /^grow/.test(token) ||
    /^shrink/.test(token) ||
    /^basis-/.test(token) ||
    /^overflow-/.test(token) ||
    /^object-/.test(token) ||
    /^opacity-/.test(token) ||
    /^z-/.test(token) ||
    /^top-|^bottom-|^left-|^right-|^inset-/.test(token) ||
    /^translate-/.test(token) ||
    /^rotate-/.test(token) ||
    /^scale-/.test(token) ||
    /^cursor-/.test(token) ||
    /^pointer-events-/.test(token) ||
    /^select-/.test(token) ||
    /^whitespace-/.test(token) ||
    /^break-/.test(token) ||
    /^truncate$/.test(token) ||
    /^line-clamp-/.test(token) ||
    /^list-/.test(token) ||
    /^aspect-/.test(token) ||
    /^sr-only$/.test(token) ||
    /^not-sr-only$/.test(token) ||
    /^underline$/.test(token) ||
    /^uppercase$/.test(token) ||
    /^lowercase$/.test(token) ||
    /^capitalize$/.test(token) ||
    /^normal-case$/.test(token) ||
    /^italic$/.test(token) ||
    /^font-/.test(token) ||
    /^leading-/.test(token) ||
    /^tracking-/.test(token) ||
    /^align-/.test(token) ||
    /^underline-offset-/.test(token) ||
    /^decoration-/.test(token) ||
    /^accent-/.test(token) ||
    /^caret-/.test(token) ||
    /^fill-/.test(token) ||
    /^stroke-/.test(token) ||
    /^ring(-|$)/.test(token) ||
    /^outline(-|$)/.test(token) ||
    /^transition/.test(token) ||
    /^duration-/.test(token) ||
    /^ease-/.test(token) ||
    /^delay-/.test(token) ||
    /^animate-/.test(token) ||
    /^backdrop-/.test(token) ||
    /^from-|^via-|^to-/.test(token) ||
    /^gradient-/.test(token) ||
    /^bg-gradient-/.test(token) ||
    /^(sm|md|lg|xl|2xl):/.test(token) ||
    /^\[/.test(token) ||
    /^relative$/.test(token) ||
    /^absolute$/.test(token) ||
    /^fixed$/.test(token) ||
    /^sticky$/.test(token) ||
    /^static$/.test(token)
  );
}

export function containsForbiddenUtility(value: string): boolean {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .some((token) => isForbiddenToken(token));
}
