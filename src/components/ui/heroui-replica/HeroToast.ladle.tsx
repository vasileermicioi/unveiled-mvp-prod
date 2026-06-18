// @ladle-only
import { HeroToast } from "./HeroToast";
import { storyBackdrop } from "./story-backdrop";

export const Success = () =>
  storyBackdrop(
    <HeroToast
      color="success"
      title="Saved"
      description="Your changes have been saved."
    />,
  );

export const ErrorToast = () =>
  storyBackdrop(
    <HeroToast
      color="danger"
      title="Error"
      description="Something went wrong."
    />,
  );

export default {
  title: "HeroUI / Toast",
  parameters: { ladle: { skipCoverage: true } },
};
