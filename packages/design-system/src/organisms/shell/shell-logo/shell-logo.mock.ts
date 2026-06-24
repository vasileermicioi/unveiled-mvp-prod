import type { ShellLogoProps } from "./shell-logo";

export function makeMockShellLogoProps(
  overrides: Partial<ShellLogoProps> = {},
): ShellLogoProps {
  return {
    variant: "black",
    className: undefined,
    ...overrides,
  };
}
