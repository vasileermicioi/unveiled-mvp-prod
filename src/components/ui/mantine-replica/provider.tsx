// @ladle-only
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type * as React from "react";

import { unveiledMantineTheme } from "@/components/ui/mantine-replica/theme";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import "./replica.css";

export function MantineReplicaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={unveiledMantineTheme} defaultColorScheme="light">
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
