import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Toast as HeroUIToast } from "../../atoms/toast";
import { cn } from "../../lib/utils";

type ToastTone = "default" | "success" | "warning" | "danger";

type ToastEntry = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (entry: Omit<ToastEntry, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_TO_HERO_COLOR: Record<
  ToastTone,
  "default" | "success" | "warning" | "danger"
> = {
  default: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
};

const TONE_TO_ACCENT_BORDER: Record<ToastTone, string> = {
  default: "border-l-brand-dark",
  success: "border-l-brand-yellow",
  warning: "border-l-[#ff5f57]",
  danger: "border-l-[#b21d17]",
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<ToastEntry[]>([]);

  const push = useCallback((entry: Omit<ToastEntry, "id">) => {
    const id = Date.now() + Math.random();
    setEntries((current) => [...current, { ...entry, id }]);
    setTimeout(() => {
      setEntries((current) => current.filter((e) => e.id !== id));
    }, 4000);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) =>
        push({ title, description, tone: "success" }),
      error: (title, description) =>
        push({ title, description, tone: "danger" }),
      warning: (title, description) =>
        push({ title, description, tone: "warning" }),
      info: (title, description) =>
        push({ title, description, tone: "default" }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4"
      >
        {entries.map((entry) => (
          <HeroUIToast
            key={entry.id}
            color={TONE_TO_HERO_COLOR[entry.tone]}
            title={entry.title}
            description={entry.description}
            hideIcon
            classNames={{
              base: cn(
                "pointer-events-auto w-full max-w-md rounded-none border-4 border-brand-dark bg-white unveiled-shadow",
                TONE_TO_ACCENT_BORDER[entry.tone],
              ),
              title: "font-display uppercase",
              description:
                "text-xs font-bold uppercase tracking-widest opacity-60",
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export type ToastProps = {
  title: string;
  description?: string;
  tone?: ToastTone;
  className?: string;
  hideIcon?: boolean;
};

export function Toast({
  title,
  description,
  tone = "default",
  className,
  hideIcon = true,
}: ToastProps): ReactNode {
  return (
    <HeroUIToast
      color={TONE_TO_HERO_COLOR[tone]}
      title={title}
      description={description}
      hideIcon={hideIcon}
      classNames={{
        base: cn(
          "rounded-none border-4 border-brand-dark bg-white unveiled-shadow",
          TONE_TO_ACCENT_BORDER[tone],
          className,
        ),
        title: "font-display uppercase",
        description: "text-xs font-bold uppercase tracking-widest opacity-60",
      }}
    />
  );
}
