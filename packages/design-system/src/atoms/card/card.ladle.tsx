// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { Card } from "./card";

export const DefaultCard = () => (
  <AtomStoryBackdrop className="grid-cols-2">
    <Card className="p-5">
      <p className="font-display text-lg uppercase">Static card</p>
      <p className="text-sm">Plain HeroUI Card wrapped with brand chrome.</p>
    </Card>
  </AtomStoryBackdrop>
);

export const InteractiveCard = () => (
  <AtomStoryBackdrop className="grid-cols-2">
    <Card interactive className="p-5">
      <p className="font-display text-lg uppercase">Interactive</p>
      <p className="text-sm">Hoverable and pressable.</p>
    </Card>
  </AtomStoryBackdrop>
);

export const Default = () => (
  <AtomStoryBackdrop className="grid-cols-2">
    <Card className="p-5">
      <p className="font-display text-lg uppercase">Static card</p>
    </Card>
    <Card interactive className="p-5">
      <p className="font-display text-lg uppercase">Interactive</p>
    </Card>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Card",
  parameters: { ladle: { skipCoverage: true } },
};
