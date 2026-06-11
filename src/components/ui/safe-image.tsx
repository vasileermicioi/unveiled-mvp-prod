import { type ImgHTMLAttributes, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset error/loaded state when src changes
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
