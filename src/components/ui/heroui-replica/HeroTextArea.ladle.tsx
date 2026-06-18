// @ladle-only
import { HeroTextArea } from "./HeroTextArea";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <HeroTextArea placeholder="Tell us more…" className="max-w-md" />,
  );

export default {
  title: "HeroUI / TextArea",
  parameters: { ladle: { skipCoverage: true } },
};
