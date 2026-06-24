// @atoms-re-export
import type { ReactNode } from "react";

import { AtomStoryBackdrop } from "../../atoms/backdrop";
import { Button } from "../../atoms/button";

import { StatePanel } from "./state-panel";

export const Empty = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <StatePanel
      title="Nothing here yet"
      text="When you create something, it will show up here."
    />
  </AtomStoryBackdrop>
);

export const Loading = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <StatePanel
      state="loading"
      title="Loading…"
      text="Hang tight, we're fetching the latest data."
    />
  </AtomStoryBackdrop>
);

export const ErrorState = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <StatePanel
      state="error"
      title="Something went wrong"
      text="We couldn't load this. Please try again."
    />
  </AtomStoryBackdrop>
);

export const Success = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <StatePanel
      state="success"
      title="All set"
      text="Your changes have been saved."
      action={(<Button variant="primary">Continue</Button>) as ReactNode}
    />
  </AtomStoryBackdrop>
);

export default {
  title: "Molecules / StatePanel",
  parameters: { ladle: { skipCoverage: true } },
};
