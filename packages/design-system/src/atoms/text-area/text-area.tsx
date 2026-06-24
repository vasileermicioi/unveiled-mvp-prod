import { Textarea as HeroUITextarea } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../../lib/utils";
import "../../styles/atom-chrome.css";

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea(props: TextAreaProps) {
  const { className, onChange, ...rest } = props;
  return (
    <HeroUITextarea
      variant="bordered"
      radius="none"
      minRows={3}
      classNames={{
        base: "unveiled-textarea-base",
        inputWrapper: cn("unveiled-textarea-wrapper", className),
        input: "unveiled-textarea-input",
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
