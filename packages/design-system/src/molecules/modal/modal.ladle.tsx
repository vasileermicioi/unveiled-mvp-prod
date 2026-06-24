// @atoms-re-export
import { useState } from "react";

import { AtomStoryBackdrop } from "../../atoms/backdrop";
import { Button } from "../../atoms/button";

import { Modal } from "./modal";

export const Default = () => {
  const [open, setOpen] = useState(false);
  return (
    <AtomStoryBackdrop className="flex-col items-stretch">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirm">
        <p>Are you sure you want to continue?</p>
      </Modal>
    </AtomStoryBackdrop>
  );
};

export const OpenWithTitle = () => <Default />;

export const BookingShell = () => {
  const [open, setOpen] = useState(false);
  return (
    <AtomStoryBackdrop className="flex-col items-stretch">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Book ticket
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Book ticket">
        <p>Booking shell body</p>
      </Modal>
    </AtomStoryBackdrop>
  );
};

export const CloseOnEscape = () => {
  const [open, setOpen] = useState(true);
  return (
    <AtomStoryBackdrop className="flex-col items-stretch">
      <p className="text-xs font-bold uppercase tracking-widest opacity-60">
        Press Escape to close (HeroUI default behaviour)
      </p>
      <Modal open={open} onClose={() => setOpen(false)} title="Closable">
        <p>Body</p>
      </Modal>
    </AtomStoryBackdrop>
  );
};

export const SizeMatrix = () => {
  const [activeSize, setActiveSize] = useState<
    "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full" | null
  >(null);
  return (
    <AtomStoryBackdrop className="flex-col items-stretch">
      <div className="flex flex-wrap gap-3">
        {(["sm", "md", "lg", "xl", "2xl"] as const).map((s) => (
          <Button key={s} variant="secondary" onClick={() => setActiveSize(s)}>
            {s}
          </Button>
        ))}
      </div>
      {activeSize ? (
        <Modal
          open
          onClose={() => setActiveSize(null)}
          title={`Size ${activeSize}`}
          size={activeSize}
        >
          <p>Modal sized {activeSize}.</p>
        </Modal>
      ) : null}
    </AtomStoryBackdrop>
  );
};

export default {
  title: "Molecules / Modal",
  parameters: { ladle: { skipCoverage: true } },
};
