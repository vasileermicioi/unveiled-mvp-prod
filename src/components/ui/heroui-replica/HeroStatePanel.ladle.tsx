// @ladle-only
import { HeroStatePanel } from "./HeroStatePanel";
import { storyBackdrop } from "./story-backdrop";

export const Empty = () =>
  storyBackdrop(
    <HeroStatePanel
      title="Nothing here"
      text="There are no items to display."
    />,
  );

export const Success = () =>
  storyBackdrop(
    <HeroStatePanel
      title="Saved"
      text="Your changes have been saved."
      state="success"
    />,
  );

export const ErrorState = () =>
  storyBackdrop(
    <HeroStatePanel title="Oops" text="Something went wrong." state="error" />,
  );

export default {
  title: "HeroUI / StatePanel",
  parameters: { ladle: { skipCoverage: true } },
};
