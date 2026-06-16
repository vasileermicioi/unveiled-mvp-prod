// @ladle-only
/**
 * Mantine 9 theme for the Unveiled design system replica.
 *
 * Wires every color in `design-tokens.json` (yellow, cream, grey, dark,
 * white, error, success) into a Mantine color tuple (10 shades) and
 * registers `theme.components` overrides for the primitives the
 * replica covers. No new hex literal is introduced; every color is
 * resolved from the typed `Color` facade in `@/lib/design-tokens`.
 *
 * NOTE: this file is a proof for the next change. It is not imported
 * by the production app and lives under the `// @ladle-only` folder.
 *
 * The next change promotes `@mantine/core`, `@mantine/hooks`, and
 * `@mantine/notifications` from `devDependencies` to `dependencies`
 * without changing the version pin declared in `package.json`.
 */
import { createTheme, type MantineColorsTuple } from "@mantine/core";

import { Color, FontFamily } from "@/lib/design-tokens";

function tupleFromBrand(hex: string): MantineColorsTuple {
  const shades: string[] = [hex];
  for (let i = 0; i < 9; i++) shades.push(hex);
  return shades as unknown as MantineColorsTuple;
}

const brandYellow = tupleFromBrand(Color.BrandYellow);
const brandCream = tupleFromBrand(Color.BrandCream);
const brandGrey = tupleFromBrand(Color.BrandGrey);
const brandDark = tupleFromBrand(Color.BrandDark);
const brandWhite = tupleFromBrand(Color.BrandWhite);
const brandError = tupleFromBrand(Color.BrandError);
const brandSuccess = tupleFromBrand(Color.BrandSuccess);

const baseButtonClassNames = {
  root: "unveiled-mantine-button-root",
};

export const unveiledMantineTheme = createTheme({
  colors: {
    brandYellow,
    brandCream,
    brandGrey,
    brandDark,
    brandWhite,
    brandError,
    brandSuccess,
  },
  black: Color.BrandDark,
  white: Color.BrandWhite,
  defaultRadius: 0,
  fontFamily: FontFamily.Body,
  fontFamilyMonospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  headings: {
    fontFamily: FontFamily.Display,
  },
  other: {
    brandDark: Color.BrandDark,
    brandWhite: Color.BrandWhite,
    brandYellow: Color.BrandYellow,
    brandCream: Color.BrandCream,
    brandGrey: Color.BrandGrey,
    brandError: Color.BrandError,
    brandSuccess: Color.BrandSuccess,
  },
  components: {
    Button: {
      classNames: baseButtonClassNames,
      defaultProps: {
        radius: 0,
      },
    },
    Badge: {
      classNames: { root: "unveiled-mantine-badge-root" },
    },
    TextInput: {
      classNames: { input: "unveiled-mantine-input" },
    },
    Textarea: {
      classNames: { input: "unveiled-mantine-input" },
    },
    Select: {
      classNames: { input: "unveiled-mantine-input" },
    },
    Card: {
      classNames: { root: "unveiled-mantine-card-root" },
    },
    Paper: {
      classNames: { root: "unveiled-mantine-paper-root" },
    },
    Divider: {
      defaultProps: {
        color: "brandDark",
        size: 4,
      },
    },
    Modal: {
      classNames: { content: "unveiled-mantine-modal-content" },
    },
    Drawer: {
      classNames: { content: "unveiled-mantine-drawer-content" },
    },
    Popover: {
      classNames: { dropdown: "unveiled-mantine-popover-dropdown" },
    },
    Tabs: {
      classNames: {
        tab: "unveiled-mantine-tab",
      },
    },
    Menu: {
      classNames: { dropdown: "unveiled-mantine-menu-dropdown" },
    },
    Notification: {
      classNames: { root: "unveiled-mantine-notification-root" },
    },
  },
});
