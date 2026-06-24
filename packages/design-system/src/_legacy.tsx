import { type ImgHTMLAttributes, useEffect, useState } from "react";

import { cn } from "./lib/utils";

type SafeImageKind = "event" | "partner" | "avatar";

const DEFAULT_FALLBACKS: Record<SafeImageKind, string> = {
  event: "/placeholders/event.svg",
  partner: "/placeholders/partner.svg",
  avatar: "/placeholders/avatar.svg",
};

export type SafeImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src?: string | null;
  fallbackSrc?: string;
  fallbackKind?: SafeImageKind;
  fadeIn?: boolean;
};

export function SafeImage({
  src,
  fallbackSrc,
  fallbackKind = "event",
  alt,
  className,
  onError,
  onLoad,
  fadeIn = false,
  ...props
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setters are stable React state dispatchers; SafeImage intentionally resets on every `src` change only.
  useEffect(() => {
    setErrored(false);
    setLoaded(false);
  }, [src]);

  const isMissing = !src || src.trim() === "";
  const shouldFallback = errored || isMissing;

  const resolvedSrc = shouldFallback
    ? (fallbackSrc ?? DEFAULT_FALLBACKS[fallbackKind])
    : src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      data-safe-image=""
      data-fallback={shouldFallback ? "true" : "false"}
      onError={(event) => {
        if (!errored) setErrored(true);
        onError?.(event);
      }}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={cn(
        "safe-image",
        fadeIn &&
          "transition-opacity duration-500 ease-in-out " +
            (loaded ? "opacity-100" : "opacity-0"),
        className,
      )}
      {...props}
    />
  );
}

export function Panel({
  as,
  className,
  tone = "white",
  shadow = true,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "form";
  tone?: "white" | "yellow" | "cream" | "dark" | "grey";
  shadow?: boolean;
}) {
  const Component = as ?? "section";
  return (
    <Component
      className={cn(
        "border-4 border-brand-dark p-5 md:p-8",
        tone === "white" && "bg-white text-brand-dark",
        tone === "yellow" && "bg-brand-yellow text-brand-dark",
        tone === "cream" && "bg-brand-cream text-brand-dark",
        tone === "grey" && "bg-brand-grey text-brand-dark",
        tone === "dark" && "bg-brand-dark text-brand-yellow",
        shadow && "unveiled-shadow",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "dark",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "dark" | "yellow" | "white" | "grey" | "success" | "error";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]",
        tone === "dark" && "bg-brand-dark text-white",
        tone === "yellow" && "bg-brand-yellow text-brand-dark",
        tone === "white" && "bg-white text-brand-dark",
        tone === "grey" && "bg-brand-grey text-brand-dark",
        tone === "success" &&
          "bg-[var(--unveiled-status-success)] text-brand-dark",
        tone === "error" && "bg-[var(--unveiled-status-error)] text-brand-dark",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function TableShell({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden border-4 border-brand-dark bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TableRow({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid gap-3 border-b-2 border-brand-dark/20 p-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
