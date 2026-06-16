// @ladle-only
import { Menu as MantineMenuBase } from "@mantine/core";

export interface MantineMenuProps {
  triggerLabel: string;
  items: Array<{
    label: string;
    onClick?: () => void;
    children?: Array<{ label: string; onClick?: () => void }>;
  }>;
}

export function MantineReplicaMenu({ triggerLabel, items }: MantineMenuProps) {
  return (
    <MantineMenuBase position="bottom-start" withArrow>
      <MantineMenuBase.Target>
        <button
          type="button"
          className="border-4 border-brand-dark bg-brand-dark px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
        >
          {triggerLabel}
        </button>
      </MantineMenuBase.Target>
      <MantineMenuBase.Dropdown>
        {items.map((item) =>
          item.children?.length ? (
            <MantineMenuBase.Item key={item.label} closeMenuOnClick={false}>
              {item.label}
              <MantineMenuBase.Divider />
              {item.children.map((child) => (
                <MantineMenuBase.Item key={child.label} onClick={child.onClick}>
                  {child.label}
                </MantineMenuBase.Item>
              ))}
            </MantineMenuBase.Item>
          ) : (
            <MantineMenuBase.Item key={item.label} onClick={item.onClick}>
              {item.label}
            </MantineMenuBase.Item>
          ),
        )}
      </MantineMenuBase.Dropdown>
    </MantineMenuBase>
  );
}
