import {
  CardBody,
  Card as HeroUICard,
  Divider as HeroUIDivider,
  Input as HeroUIInput,
  Select as HeroUISelect,
  Table as HeroUITable,
  TableBody as HeroUITableBody,
  TableCell as HeroUITableCell,
  TableColumn as HeroUITableColumn,
  TableHeader as HeroUITableHeader,
  TableRow as HeroUITableRow,
  Textarea as HeroUITextarea,
  SelectItem,
  type Selection,
} from "@nextui-org/react";
import React from "react";

import { StatusColor } from "./lib/design-tokens";
import { cn } from "./lib/utils";

const SURFACE_BORDER_CLASSES = "border-4 border-brand-dark p-5 md:p-8";
const SURFACE_SHADOW_CLASS = "unveiled-shadow";

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
        SURFACE_BORDER_CLASSES,
        tone === "white" && "bg-white text-brand-dark",
        tone === "yellow" && "bg-brand-yellow text-brand-dark",
        tone === "cream" && "bg-brand-cream text-brand-dark",
        tone === "grey" && "bg-brand-grey text-brand-dark",
        tone === "dark" && "bg-brand-dark text-brand-yellow",
        shadow && SURFACE_SHADOW_CLASS,
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  interactive = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
}) {
  return (
    <HeroUICard
      isHoverable={interactive}
      isPressable={interactive}
      className={cn(
        "rounded-none border-4 border-brand-dark bg-white text-brand-dark",
        interactive && "unveiled-card-hover",
        className,
      )}
      {...(props as unknown as React.ComponentProps<typeof HeroUICard>)}
    >
      <CardBody className="p-0">{children}</CardBody>
    </HeroUICard>
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
        tone === "success" && `bg-[${StatusColor.Success}] text-brand-dark`,
        tone === "error" && `bg-[${StatusColor.Error}] text-brand-dark`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
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

const TEXT_INPUT_CLASS = cn(
  "min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm font-bold outline-none placeholder:text-brand-dark/30 focus:bg-brand-cream focus:ring-4 focus:ring-brand-dark/15 disabled:bg-brand-grey disabled:opacity-50",
);

export function TextInput(
  props: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue"
  > & {
    value?: string | number | readonly string[];
    defaultValue?: string | number | readonly string[];
  },
) {
  const { value, defaultValue, type, onChange, className, ...rest } = props;

  return (
    <HeroUIInput
      type={type as React.ComponentProps<typeof HeroUIInput>["type"]}
      value={value === undefined ? undefined : String(value)}
      defaultValue={
        defaultValue === undefined ? undefined : String(defaultValue)
      }
      variant="bordered"
      radius="none"
      classNames={{
        base: "data-[focus-visible=true]:!outline-none data-[focus-visible=true]:!shadow-none group-data-[focus-visible=true]:!ring-0 group-data-[focus-visible=true]:!shadow-none",
        inputWrapper: cn(
          "!min-h-12 !h-12 !bg-white !border-4 !border-brand-dark !rounded-none !px-4 !py-3 focus-within:!ring-0 focus-within:!ring-offset-0 focus-within:!shadow-none data-[focus=true]:!border-brand-dark data-[focus-visible=true]:!outline-none",
          className,
        ),
        input:
          "!text-sm !font-bold !text-brand-dark placeholder:!text-brand-dark/30",
      }}
      onValueChange={
        onChange
          ? (next) => {
              onChange({
                currentTarget: { value: next },
                target: { value: next },
              } as unknown as React.ChangeEvent<HTMLInputElement>);
            }
          : undefined
      }
      {...(rest as unknown as Omit<
        React.ComponentProps<typeof HeroUIInput>,
        "value" | "defaultValue" | "onChange" | "type"
      >)}
    />
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
        trigger: cn(
          "!min-h-12 !h-12 !bg-white !border-4 !border-brand-dark !rounded-none !px-4 !py-3 data-[focus=true]:!border-brand-dark data-[focus-visible=true]:!outline-none data-[focus=true]:!shadow-none",
          className,
        ),
        value:
          "!text-sm !font-black !uppercase !tracking-widest !text-brand-dark",
        listbox: "!rounded-none",
      }}
      popoverProps={{
        classNames: {
          content:
            "!rounded-none !border-4 !border-brand-dark !bg-white !p-0 !shadow-[8px_8px_0_0_var(--brand-dark)]",
        },
      }}
      listboxProps={{
        itemClasses: {
          base: "!rounded-none !text-brand-dark data-[hover=true]:!bg-brand-yellow data-[hover=true]:!text-brand-dark data-[selectable=true]:focus:!bg-brand-yellow data-[selectable=true]:focus:!text-brand-dark data-[selectable=true]:focus-visible:!outline-none data-[focus-visible=true]:!outline-none",
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

export { SelectItem };

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, onChange, ...rest } = props;
  return (
    <HeroUITextarea
      variant="bordered"
      radius="none"
      minRows={4}
      classNames={{
        base: "data-[focus-visible=true]:!outline-none data-[focus-visible=true]:!shadow-none group-data-[focus-visible=true]:!ring-0 group-data-[focus-visible=true]:!shadow-none",
        inputWrapper: cn(
          "!min-h-28 !bg-white !border-4 !border-brand-dark !rounded-none !px-4 !py-3 focus-within:!ring-0 focus-within:!ring-offset-0 focus-within:!shadow-none data-[focus=true]:!border-brand-dark data-[focus-visible=true]:!outline-none",
          className,
        ),
        input:
          "!text-sm !font-bold !text-brand-dark placeholder:!text-brand-dark/30",
      }}
      onValueChange={
        onChange
          ? (next) => {
              onChange({
                currentTarget: { value: next },
                target: { value: next },
              } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
            }
          : undefined
      }
      {...(rest as unknown as Omit<
        React.ComponentProps<typeof HeroUITextarea>,
        "onChange"
      >)}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <HeroUIDivider
      orientation="horizontal"
      className={cn("h-1 w-full bg-brand-dark", className)}
    />
  );
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
      tone={
        state === "error" ? "white" : state === "success" ? "yellow" : "cream"
      }
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

export {
  HeroUITable,
  HeroUITableBody,
  HeroUITableCell,
  HeroUITableColumn,
  HeroUITableHeader,
  HeroUITableRow,
};
