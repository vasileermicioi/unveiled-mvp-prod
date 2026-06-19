// @ladle-only
import { HeroTextInput } from "./HeroTextInput";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(<HeroTextInput placeholder="Enter text…" />);

export const Disabled = () =>
  storyBackdrop(<HeroTextInput isDisabled placeholder="Disabled" />);

export default {
  title: "HeroUI / TextInput",
  parameters: { ladle: { skipCoverage: true } },
};
