// @ladle-only
import {
  Border,
  BrandColor,
  FontFamily,
  FontSize,
  FontWeight,
  LetterSpacing,
  LineHeight,
  Motion,
  Radius,
  Shadow,
} from "../lib/design-tokens";

export const heroUITokens = {
  colors: {
    yellow: BrandColor.Yellow,
    cream: BrandColor.Cream,
    grey: BrandColor.Grey,
    dark: BrandColor.Dark,
    white: BrandColor.White,
    error: BrandColor.Error,
    success: BrandColor.Success,
  },
  semantic: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    primary: "var(--primary)",
    "primary-foreground": "var(--primary-foreground)",
    secondary: "var(--secondary)",
    "secondary-foreground": "var(--secondary-foreground)",
    muted: "var(--muted)",
    "muted-foreground": "var(--muted-foreground)",
    accent: "var(--accent)",
    "accent-foreground": "var(--accent-foreground)",
    destructive: "var(--destructive)",
    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",
  },
  layout: {
    radius: {
      none: Radius.None,
      sm: Radius.Sm,
      md: Radius.Md,
      lg: Radius.Lg,
      full: Radius.Full,
    },
    borderWidth: {
      unveiled: Border.Unveiled,
      "unveiled-lg": Border.UnveiledLg,
      input: Border.Input,
      card: Border.Card,
    },
    shadow: {
      sm: Shadow.UnveiledSm,
      DEFAULT: Shadow.Unveiled,
      lg: Shadow.UnveiledLg,
      hover: Shadow.UnveiledHover,
      "hover-lg": Shadow.UnveiledHoverLg,
    },
  },
  typography: {
    fontFamily: {
      display: FontFamily.Display,
      body: FontFamily.Body,
    },
    fontWeight: {
      regular: String(FontWeight.Regular),
      bold: String(FontWeight.Bold),
      black: String(FontWeight.Black),
    },
    fontSize: {
      xs: FontSize.Xs,
      sm: FontSize.Sm,
      base: FontSize.Base,
      lg: FontSize.Lg,
      xl: FontSize.Xl,
      "2xl": FontSize["2xl"],
      "3xl": FontSize["3xl"],
      "4xl": FontSize["4xl"],
      "6xl": FontSize["6xl"],
    },
    letterSpacing: {
      tight: LetterSpacing.Tight,
      normal: LetterSpacing.Normal,
      wide: LetterSpacing.Wide,
      wider: LetterSpacing.Wider,
    },
    lineHeight: {
      tight: String(LineHeight.Tight),
      snug: String(LineHeight.Snug),
      display: String(LineHeight.Display),
      body: String(LineHeight.Body),
      relaxed: String(LineHeight.Relaxed),
    },
    textCase: {
      uppercase: "uppercase",
    },
  },
  motion: {
    duration: {
      fast: Motion.DurationFast,
      base: Motion.DurationBase,
      slow: Motion.DurationSlow,
    },
    easing: {
      easeOut: Motion.EasingEaseOut,
      easeInOut: Motion.EasingEaseInOut,
    },
    transition: {
      cardHover: Motion.TransitionCardHover,
    },
  },
} as const;
