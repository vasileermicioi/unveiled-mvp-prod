// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { TextArea } from "./text-area";

export const MultiLine = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <TextArea defaultValue={"Line 1\nLine 2\nLine 3"} aria-label="Multi-line" />
  </AtomStoryBackdrop>
);

export const Disabled = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <TextArea disabled defaultValue="Disabled textarea" aria-label="Disabled" />
  </AtomStoryBackdrop>
);

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <TextArea placeholder="Tell us more" aria-label="Default textarea" />
  </AtomStoryBackdrop>
);

export const Variants = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <TextArea defaultValue="Pre-filled content" aria-label="Pre-filled" />
    <TextArea disabled defaultValue="Disabled" aria-label="Disabled" />
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / TextArea",
  parameters: { ladle: { skipCoverage: true } },
};
