import {
  ShellIconButtonPresentational,
  type ShellIconButtonProps,
} from "./shell-icon-button";

// source: lucide-static
const HamburgerIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="3"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// source: lucide-static
const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="3"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
);

export function makeMockShellIconButtonProps(
  overrides: Partial<ShellIconButtonProps> = {},
): ShellIconButtonProps {
  return {
    children: <HamburgerIcon className="size-5 md:size-6" />,
    "aria-label": "Open menu",
    onClick: () => undefined,
    className: undefined,
    size: "md",
    ...overrides,
  };
}

export const Hamburger = () => (
  <ShellIconButtonPresentational {...makeMockShellIconButtonProps()} />
);

export const Close = () => (
  <ShellIconButtonPresentational
    {...makeMockShellIconButtonProps({
      children: <CloseIcon className="size-5 md:size-6" />,
      "aria-label": "Close",
    })}
  />
);

export const Small = () => (
  <ShellIconButtonPresentational
    {...makeMockShellIconButtonProps({ size: "sm" })}
  />
);

export default {
  title: "Organisms / Shell / Icon Button",
  parameters: { ladle: { skipCoverage: true } },
};
