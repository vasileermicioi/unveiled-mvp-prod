// @ladle-only
/**
 * Helper for the Mantine 9 replica.
 *
 * Re-exports `cn` from `@/lib/utils` and adds `withMantine`, a merge
 * helper that combines a `style` prop, a `classNames` object, and the
 * brand-token CSS variables. The next change moves `withMantine` into
 * `src/lib/utils.ts` once `@mantine/*` is promoted from
 * `devDependencies` to `dependencies` and the production app may
 * import Mantine.
 *
 * The pin in `package.json` is the contract: this file does not need
 * to be re-exported by the production app for the next change to
 * succeed; the version pin is what carries across.
 */
import type * as React from "react";

import { cn } from "@/lib/utils";

export { cn };

export function withMantine<T extends Record<string, unknown>>(
  props: T,
  style?: React.CSSProperties,
  classNames?: Record<string, string>,
): T & {
  style?: React.CSSProperties;
  classNames?: Record<string, string>;
} {
  return {
    ...props,
    style: { ...(props.style as React.CSSProperties | undefined), ...style },
    classNames: { ...(props.classNames ?? {}), ...classNames },
  };
}
