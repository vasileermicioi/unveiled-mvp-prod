// @ladle-only
import type { Story } from "@ladle/react";
import { useState } from "react";

import "@/styles/global.css";
import { Drawer } from "@unveiled/design-system";

export const OpenRightPlacement: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title="Saved events"
      placement="right"
    >
      <p>Saved events list</p>
    </Drawer>
  );
};

export const CloseOnEscape: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <Drawer open={open} onClose={() => setOpen(false)} title="Saved events">
      <p>Press escape to close</p>
    </Drawer>
  );
};

export default {
  title: "ui-system / Drawer",
};
