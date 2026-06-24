// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { Divider } from "./divider";

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <p className="font-display text-sm uppercase opacity-60">Above</p>
    <Divider />
    <p className="font-display text-sm uppercase opacity-60">Below</p>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Divider",
  parameters: { ladle: { skipCoverage: true } },
};
