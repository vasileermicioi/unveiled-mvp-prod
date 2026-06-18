// @ladle-only
import { useState } from "react";
import { HeroButton } from "./HeroButton";
import {
  HeroDrawer,
  HeroDrawerBody,
  HeroDrawerContent,
  HeroDrawerFooter,
  HeroDrawerHeader,
} from "./HeroDrawer";
import { storyBackdrop } from "./story-backdrop";

export const Default = () => {
  const [open, setOpen] = useState(true);
  return storyBackdrop(
    <HeroDrawer isOpen={open} onOpenChange={setOpen}>
      <HeroDrawerContent>
        <HeroDrawerHeader className="font-display uppercase">
          Drawer Title
        </HeroDrawerHeader>
        <HeroDrawerBody>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">
            Drawer body content.
          </p>
        </HeroDrawerBody>
        <HeroDrawerFooter>
          <HeroButton onPress={() => setOpen(false)}>Close</HeroButton>
        </HeroDrawerFooter>
      </HeroDrawerContent>
    </HeroDrawer>,
  );
};

export default {
  title: "HeroUI / Drawer",
  parameters: { ladle: { skipCoverage: true } },
};
