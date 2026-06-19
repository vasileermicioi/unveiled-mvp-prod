// @ladle-only
import { HeroDivider } from "./HeroDivider";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <div className="space-y-2">
      <p className="text-sm font-bold uppercase tracking-widest">Above</p>
      <HeroDivider />
      <p className="text-sm font-bold uppercase tracking-widest">Below</p>
    </div>,
  );

export default {
  title: "HeroUI / Divider",
  parameters: { ladle: { skipCoverage: true } },
};
