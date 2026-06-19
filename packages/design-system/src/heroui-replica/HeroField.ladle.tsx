// @ladle-only
import { HeroField } from "./HeroField";
import { HeroTextInput } from "./HeroTextInput";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <HeroField
      label="Email"
      htmlFor="email"
      helper="We will never share your email."
    >
      <HeroTextInput id="email" placeholder="you@example.com" />
    </HeroField>,
  );

export const WithError = () =>
  storyBackdrop(
    <HeroField
      label="Email"
      htmlFor="email-error"
      error="Please enter a valid email."
    >
      <HeroTextInput id="email-error" invalid placeholder="you@example.com" />
    </HeroField>,
  );

export default {
  title: "HeroUI / Field",
  parameters: { ladle: { skipCoverage: true } },
};
