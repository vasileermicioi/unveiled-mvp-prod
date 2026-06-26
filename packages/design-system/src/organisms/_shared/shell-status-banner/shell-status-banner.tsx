import { cn } from "../../../lib/utils";

export type ShellStatusBannerType = "error" | "warning" | "info";

export interface ShellStatusBannerAction {
  id: string;
  label: string;
  onSelect: () => void;
  variant?: "primary" | "secondary" | "destructive";
  testId?: string;
}

export interface ShellStatusBannerProps {
  type: ShellStatusBannerType;
  title: string;
  body?: string;
  actions?: ShellStatusBannerAction[];
  className?: string;
}

const TONE_CLASSES: Record<ShellStatusBannerType, string> = {
  error: "bg-[var(--unveiled-status-error)] text-brand-dark",
  warning: "bg-brand-yellow text-brand-dark",
  info: "bg-brand-grey text-brand-dark",
};

const TONE_BORDER: Record<ShellStatusBannerType, string> = {
  error: "border-[var(--unveiled-status-error)]",
  warning: "border-brand-dark",
  info: "border-brand-dark",
};

const TYPE_LABEL: Record<ShellStatusBannerType, string> = {
  error: "Error",
  warning: "Warning",
  info: "Info",
};

export function ShellStatusBannerPresentational({
  type,
  title,
  body,
  actions,
  className,
}: ShellStatusBannerProps) {
  return (
    <section
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      data-status-banner={type}
      className={cn(
        "border-4 p-4 md:p-5",
        TONE_BORDER[type],
        TONE_CLASSES[type],
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-yellow">
            {TYPE_LABEL[type]}
          </span>
          <p className="headline-sm mt-2">{title}</p>
          {body ? (
            <p className="text-sm font-medium leading-snug text-brand-dark/80">
              {body}
            </p>
          ) : null}
        </div>
        {actions && actions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                data-testid={action.testId ?? `status-banner-${action.id}`}
                onClick={action.onSelect}
                className={cn(
                  "inline-flex items-center justify-center gap-2 border-2 border-brand-dark px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all",
                  action.variant === "destructive"
                    ? "bg-[#ff5f57] text-brand-dark hover:bg-white"
                    : action.variant === "secondary"
                      ? "bg-white text-brand-dark hover:bg-brand-yellow"
                      : "bg-brand-dark text-white hover:bg-brand-yellow hover:text-brand-dark",
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
