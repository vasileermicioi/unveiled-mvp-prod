import {
  Select as HeroUISelect,
  SelectItem,
  type Selection,
} from "@nextui-org/react";
import React from "react";

import { Card } from "./atoms/card";
import "./styles/atom-chrome.css";
import { cn } from "./lib/utils";

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
  htmlFor,
  error,
  helper,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={htmlFor} className="unveiled-meta">
        {label}
      </label>
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

const STATE_PANEL_TONES = {
  empty: "bg-brand-cream text-brand-dark",
  loading: "bg-brand-cream text-brand-dark",
  error: "bg-white text-brand-dark",
  success: "bg-brand-yellow text-brand-dark",
} as const;

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
    <section
      className={cn(
        "grid min-h-44 place-items-center border-4 border-brand-dark p-5 text-center md:p-8",
        STATE_PANEL_TONES[state],
      )}
    >
      <div className="max-w-md space-y-4">
        <p className="headline-md">{title}</p>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">
          {text}
        </p>
        {action}
      </div>
    </section>
  );
}

export function SelectInput({
  value,
  defaultValue,
  onChange,
  className,
  children,
  ...rest
}: Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  const selectedKeys = value !== undefined ? new Set([value]) : undefined;
  const defaultSelectedKeys =
    defaultValue !== undefined ? new Set([defaultValue]) : undefined;
  const items = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => {
      if (
        !React.isValidElement<{ value?: string; children?: React.ReactNode }>(
          child,
        )
      ) {
        return null;
      }
      const itemValue = child.props.value ?? "";
      const itemLabel = child.props.children;
      return (
        <SelectItem key={itemValue} textValue={String(itemValue)}>
          {itemLabel as React.ReactNode}
        </SelectItem>
      );
    });

  return (
    <HeroUISelect
      selectedKeys={selectedKeys as unknown as Selection}
      defaultSelectedKeys={defaultSelectedKeys as unknown as Selection}
      variant="bordered"
      radius="none"
      classNames={{
        base: "data-[focus-visible=true]:!outline-none data-[focus-visible=true]:!shadow-none group-data-[focus-visible=true]:!ring-0 group-data-[focus-visible=true]:!shadow-none",
        trigger: cn("unveiled-select-trigger", className),
        value: "unveiled-select-value",
        listbox: "!rounded-none !p-0 !gap-0",
        listboxWrapper: "!p-0",
        popoverContent: "unveiled-select-popover",
      }}
      listboxProps={{
        itemClasses: {
          base: "unveiled-select-item !rounded-none !px-4 !py-3",
        },
      }}
      onSelectionChange={(keys) => {
        if (!onChange) return;
        const next = [...(keys as Set<string>)][0] ?? "";
        onChange({
          currentTarget: { value: next },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
      {...(rest as unknown as Omit<
        React.ComponentProps<typeof HeroUISelect>,
        "children" | "value" | "defaultValue" | "onChange"
      >)}
    >
      {items}
    </HeroUISelect>
  );
}
