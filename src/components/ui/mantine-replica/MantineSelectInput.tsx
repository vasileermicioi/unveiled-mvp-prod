// @ladle-only
import { Select as MantineSelectBase } from "@mantine/core";

export interface MantineSelectInputProps {
  label?: string;
  error?: string;
  helper?: string;
  data?: Array<{ value: string; label: string }>;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
}

export function MantineSelectInput({
  label,
  error,
  helper,
  data = [],
  placeholder,
  defaultValue,
  disabled,
  className,
}: MantineSelectInputProps) {
  return (
    <div className="grid gap-2">
      {label ? <span className="unveiled-meta">{label}</span> : null}
      <MantineSelectBase
        className={className}
        data={data}
        error={error}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
      />
      {error ? (
        <span className="unveiled-mantine-error-text">{error}</span>
      ) : helper ? (
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          {helper}
        </span>
      ) : null}
    </div>
  );
}
