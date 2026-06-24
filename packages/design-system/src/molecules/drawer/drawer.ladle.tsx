// @atoms-re-export
import { useState } from "react";

import { AtomStoryBackdrop } from "../../atoms/backdrop";
import { Button } from "../../atoms/button";

import { Drawer } from "./drawer";

export const Default = () => {
  const [open, setOpen] = useState(false);
  return (
    <AtomStoryBackdrop className="flex-col items-stretch">
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Notifications"
        placement="right"
      >
        <p>Drawer body content</p>
      </Drawer>
    </AtomStoryBackdrop>
  );
};

export const OpenRightPlacement = () => <Default />;

export const CloseOnEscape = () => {
  const [open, setOpen] = useState(true);
  return (
    <AtomStoryBackdrop className="flex-col items-stretch">
      <p className="text-xs font-bold uppercase tracking-widest opacity-60">
        Press Escape to close (HeroUI default behaviour)
      </p>
      <Drawer open={open} onClose={() => setOpen(false)} title="Closable">
        <p>Body</p>
      </Drawer>
    </AtomStoryBackdrop>
  );
};

export const PlacementMatrix = () => {
  const [placement, setPlacement] = useState<
    "left" | "right" | "top" | "bottom" | null
  >(null);
  return (
    <AtomStoryBackdrop className="flex-col items-stretch">
      <div className="flex flex-wrap gap-3">
        {(["left", "right", "top", "bottom"] as const).map((p) => (
          <Button key={p} variant="secondary" onClick={() => setPlacement(p)}>
            {p}
          </Button>
        ))}
      </div>
      {placement ? (
        <Drawer
          open
          onClose={() => setPlacement(null)}
          title={`${placement} drawer`}
          placement={placement}
        >
          <p>Drawn from the {placement}.</p>
        </Drawer>
      ) : null}
    </AtomStoryBackdrop>
  );
};

export default {
  title: "Molecules / Drawer",
  parameters: { ladle: { skipCoverage: true } },
};
