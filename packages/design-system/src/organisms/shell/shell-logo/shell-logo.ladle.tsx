import { ShellLogoPresentational } from "./shell-logo";
import { makeMockShellLogoProps } from "./shell-logo.mock";

// source: lucide-static
const LogoPlaceholder = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={
      "grid h-9 w-32 place-items-center border-2 border-dashed border-brand-dark/40 text-[8px] font-black uppercase tracking-widest text-brand-dark/60 " +
      (className ?? "")
    }
  >
    Logo
  </div>
);

export const Default = () => (
  <ShellLogoPresentational {...makeMockShellLogoProps()} />
);

export const Black = () => (
  <ShellLogoPresentational {...makeMockShellLogoProps({ variant: "black" })} />
);

export const White = () => (
  <div className="bg-brand-dark p-4">
    <ShellLogoPresentational
      {...makeMockShellLogoProps({ variant: "white" })}
    />
  </div>
);

export const CustomSize = () => (
  <ShellLogoPresentational
    {...makeMockShellLogoProps({ className: "h-12 w-auto" })}
  />
);

export const WithPlaceholderLogo = () => (
  <div className="flex items-center gap-3">
    <ShellLogoPresentational {...makeMockShellLogoProps()} />
    <LogoPlaceholder className="h-7" />
  </div>
);

export default {
  title: "Organisms / Shell / Logo",
  parameters: { ladle: { skipCoverage: true } },
};
