import React from "react";

import {
  SelectItem,
  SelectTrigger,
  type Selection,
} from "../../atoms/select-item";
import { cn } from "../../lib/utils";
import "../../styles/atom-chrome.css";

export type SelectInputProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  placeholder?: string;
  className?: string;
};

export function SelectInput({
  value,
  defaultValue,
  onChange,
  className,
  children,
  ...rest
}: SelectInputProps) {
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
    <SelectTrigger
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
        React.ComponentProps<typeof SelectTrigger>,
        "children" | "value" | "defaultValue" | "onChange"
      >)}
    >
      {items}
    </SelectTrigger>
  );
}
