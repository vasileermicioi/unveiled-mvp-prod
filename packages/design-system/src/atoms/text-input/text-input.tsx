import { Input as HeroUIInput } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../../lib/utils";
import "../../styles/atom-chrome.css";

export type TextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue"
> & {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
};

export function TextInput(props: TextInputProps) {
  const { value, defaultValue, type, onChange, className, ...rest } = props;

  return (
    <HeroUIInput
      type={type as React.ComponentProps<typeof HeroUIInput>["type"]}
      value={value === undefined ? undefined : String(value)}
      defaultValue={
        defaultValue === undefined ? undefined : String(defaultValue)
      }
      variant="flat"
      radius="none"
      classNames={{
        base: cn("unveiled-text-input-base", className),
        inputWrapper: "unveiled-text-input-wrapper",
        input: "unveiled-text-input-input",
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
