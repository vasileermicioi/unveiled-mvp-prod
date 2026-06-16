// @ladle-only
import { notifications } from "@mantine/notifications";
import type * as React from "react";

export type MantineNotificationTone = "info" | "success" | "error" | "warning";

const TONE_TO_COLOR: Record<MantineNotificationTone, string> = {
  info: "var(--brand-dark)",
  success: "var(--brand-success)",
  error: "var(--brand-error)",
  warning: "var(--brand-yellow)",
};

export interface MantineNotificationProps {
  tone: MantineNotificationTone;
  title: string;
  message: string;
  trigger?: React.ReactNode;
}

export function MantineReplicaNotification({
  tone,
  title,
  message,
  trigger,
}: MantineNotificationProps) {
  return (
    <button
      type="button"
      onClick={() =>
        notifications.show({
          title,
          message,
          color: TONE_TO_COLOR[tone],
          withBorder: true,
        })
      }
      className="border-4 border-brand-dark bg-brand-dark px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
    >
      {trigger ?? `Show ${tone}`}
    </button>
  );
}
