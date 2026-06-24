// @atoms-re-export
import { AtomStoryBackdrop } from "../../atoms/backdrop";
import { TextInput } from "../../atoms/text-input";

import { Field } from "./field";

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Field label="Email" htmlFor="field-email">
      <TextInput id="field-email" placeholder="you@example.com" />
    </Field>
  </AtomStoryBackdrop>
);

export const WithHelper = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Field label="Display name" htmlFor="field-name" helper="Visible to others">
      <TextInput id="field-name" placeholder="Pat" />
    </Field>
  </AtomStoryBackdrop>
);

export const WithError = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Field
      label="Email"
      htmlFor="field-email-err"
      error="Please enter a valid email address"
    >
      <TextInput id="field-email-err" defaultValue="not-an-email" />
    </Field>
  </AtomStoryBackdrop>
);

export const LabelWithHint = () => <WithHelper />;

export const LabelWithError = () => <WithError />;

export default {
  title: "Molecules / Field",
  parameters: { ladle: { skipCoverage: true } },
};
