import type * as React from "react";

import { cn } from "@/lib/utils";

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

export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
}) {
  return (
    <article
      className={cn(
        "border-4 border-brand-dark bg-white text-brand-dark",
        interactive && "unveiled-card-hover",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "dark",
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
        tone === "success" && "bg-[#35c46b] text-brand-dark",
        tone === "error" && "bg-[#ff5f57] text-brand-dark",
        className,
      )}
      {...props}
    />
  );
}

export function StatPanel({
  label,
  value,
  caption,
  className,
}: {
  label: string;
  value: string;
  caption?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-4 md:p-6", className)}>
      <p className="unveiled-meta opacity-45">{label}</p>
      <p className="mt-3 font-display text-4xl font-black uppercase leading-none md:text-6xl">
        {value}
      </p>
      {caption ? (
        <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">
          {caption}
        </p>
      ) : null}
    </Card>
  );
}

export function Field({
  label,
  error,
  helper,
  children,
  className,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <span className="unveiled-meta">{label}</span>
      {children}
      {error ? (
        <span className="text-[10px] font-black uppercase tracking-widest text-[#b21d17]">
          {error}
        </span>
      ) : helper ? (
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          {helper}
        </span>
      ) : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm font-bold outline-none placeholder:text-brand-dark/30 focus:bg-brand-cream focus:ring-4 focus:ring-brand-dark/15 disabled:bg-brand-grey disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm font-black uppercase tracking-widest outline-none focus:bg-brand-cream focus:ring-4 focus:ring-brand-dark/15 disabled:bg-brand-grey disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm font-bold outline-none placeholder:text-brand-dark/30 focus:bg-brand-cream focus:ring-4 focus:ring-brand-dark/15 disabled:bg-brand-grey disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-1 w-full bg-brand-dark", className)} />;
}

export function StatePanel({
  title,
  text,
  state = "empty",
  action,
}: {
  title: string;
  text: string;
  state?: "empty" | "loading" | "error" | "success";
  action?: React.ReactNode;
}) {
  return (
    <Panel
      tone={state === "error" ? "white" : state === "success" ? "yellow" : "cream"}
      className="grid min-h-44 place-items-center text-center"
      shadow={false}
    >
      <div className="max-w-md space-y-4">
        <p className="headline-md">{title}</p>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">
          {text}
        </p>
        {action}
      </div>
    </Panel>
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
