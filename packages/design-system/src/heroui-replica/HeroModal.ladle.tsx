// @ladle-only
import { useState } from "react";
import { HeroButton } from "./HeroButton";
import {
  HeroModal,
  HeroModalBody,
  HeroModalContent,
  HeroModalFooter,
  HeroModalHeader,
} from "./HeroModal";
import { storyBackdrop } from "./story-backdrop";

export const Default = () => {
  const [open, setOpen] = useState(true);
  return storyBackdrop(
    <HeroModal isOpen={open} onOpenChange={setOpen}>
      <HeroModalContent>
        <HeroModalHeader className="font-display uppercase">
          Modal Title
        </HeroModalHeader>
        <HeroModalBody>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">
            Modal body content.
          </p>
        </HeroModalBody>
        <HeroModalFooter>
          <HeroButton onPress={() => setOpen(false)}>Close</HeroButton>
        </HeroModalFooter>
      </HeroModalContent>
    </HeroModal>,
  );
};

export default {
  title: "HeroUI / Modal",
  parameters: { ladle: { skipCoverage: true } },
};
