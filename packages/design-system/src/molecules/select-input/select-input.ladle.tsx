// @atoms-re-export
import { AtomStoryBackdrop } from "../../atoms/backdrop";

import { SelectInput } from "./select-input";

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <SelectInput placeholder="Pick a fruit">
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </SelectInput>
  </AtomStoryBackdrop>
);

export const WithValue = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <SelectInput defaultValue="banana">
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </SelectInput>
  </AtomStoryBackdrop>
);

export const SelectionChange = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <SelectInput
      placeholder="Pick one"
      onChange={(event) => {
        // eslint-disable-next-line no-console
        console.log("selected", event.currentTarget.value);
      }}
    >
      <option value="red">Red</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
    </SelectInput>
  </AtomStoryBackdrop>
);

export const Disabled = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <SelectInput placeholder="Disabled" disabled>
      <option value="a">A</option>
      <option value="b">B</option>
    </SelectInput>
  </AtomStoryBackdrop>
);

export default {
  title: "Molecules / SelectInput",
  parameters: { ladle: { skipCoverage: true } },
};
