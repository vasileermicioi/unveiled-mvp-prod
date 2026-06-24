// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { TextInput } from "./text-input";

export const Disabled = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <TextInput
      disabled
      defaultValue="Disabled input"
      aria-label="Disabled input"
    />
  </AtomStoryBackdrop>
);

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <TextInput placeholder="Type here" aria-label="Default input" />
  </AtomStoryBackdrop>
);

export const Variants = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <TextInput defaultValue="With value" aria-label="With value" />
    <TextInput type="email" placeholder="email@x.com" aria-label="Email" />
    <TextInput disabled defaultValue="Disabled" aria-label="Disabled" />
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / TextInput",
  parameters: { ladle: { skipCoverage: true } },
};
