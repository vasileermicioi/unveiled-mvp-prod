// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { SelectItem } from "./select-item";

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <p className="text-sm font-bold uppercase tracking-widest opacity-60">
      SelectItem is a pass-through re-export of @nextui-org/react. It renders
      the options inside a HeroUI Select (or SelectInput). For a working
      dropdown, see the Select story.
    </p>
    <p className="text-xs font-bold uppercase tracking-widest opacity-60">
      Rendered reference: <SelectItem key="x">X</SelectItem>
    </p>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / SelectItem",
  parameters: { ladle: { skipCoverage: true } },
};
