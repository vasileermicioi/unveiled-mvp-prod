// @ladle-only
import { HeroSelectInput, HeroSelectItem } from "./HeroSelectInput";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <HeroSelectInput
      label="Choose"
      placeholder="Select an option"
      className="max-w-xs"
    >
      <HeroSelectItem key="a">Option A</HeroSelectItem>
      <HeroSelectItem key="b">Option B</HeroSelectItem>
      <HeroSelectItem key="c">Option C</HeroSelectItem>
    </HeroSelectInput>,
  );

export default {
  title: "HeroUI / SelectInput",
  parameters: { ladle: { skipCoverage: true } },
};
