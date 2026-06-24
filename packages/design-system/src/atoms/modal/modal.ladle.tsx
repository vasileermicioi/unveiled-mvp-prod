// @atoms-re-export
import { Button } from "@nextui-org/react";

import { AtomStoryBackdrop } from "../backdrop";

export const Placeholder = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Button>Open modal (story placeholder)</Button>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Modal",
  parameters: { ladle: { skipCoverage: true } },
};
