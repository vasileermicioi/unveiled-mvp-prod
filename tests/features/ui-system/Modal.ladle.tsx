// @ladle-only
import type { Story } from "@ladle/react";
import { useState } from "react";

import "@unveiled/app/styles/global.css";
import { Modal } from "@unveiled/design-system";

export const OpenWithTitle: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Confirm booking">
      <p>Are you sure you want to book this event?</p>
    </Modal>
  );
};

export const BookingShell: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Book event">
      <div className="bg-brand-yellow p-6">Booking body</div>
    </Modal>
  );
};

export const CloseOnEscape: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Confirm booking">
      <p>Press escape to close</p>
    </Modal>
  );
};

export default {
  title: "ui-system / Modal",
};
