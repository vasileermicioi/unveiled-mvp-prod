// @ladle-only
// @atoms-re-export
import type { ReactNode } from "react";

import { AtomStoryBackdrop } from "../../atoms/backdrop";

import { Badge } from "./badge";

export const Default = () => (
  <AtomStoryBackdrop className="flex-row gap-3">
    <Badge tone="dark">Dark</Badge>
    <Badge tone="yellow">Yellow</Badge>
    <Badge tone="white">White</Badge>
    <Badge tone="grey">Grey</Badge>
    <Badge tone="success">Success</Badge>
    <Badge tone="error">Error</Badge>
  </AtomStoryBackdrop>
);

export const ToneMatrix = () => (
  <AtomStoryBackdrop
    className="flex-row flex-wrap gap-3"
    aria-label="Badge tone matrix"
  >
    <Badge tone="dark">dark</Badge>
    <Badge tone="yellow">yellow</Badge>
    <Badge tone="white">white</Badge>
    <Badge tone="grey">grey</Badge>
    <Badge tone="success">success</Badge>
    <Badge tone="error">error</Badge>
  </AtomStoryBackdrop>
);

export const WithContent = () => (
  <AtomStoryBackdrop className="flex-row gap-3">
    <Badge content={"3"}>Inbox</Badge>
  </AtomStoryBackdrop>
);

export const CountAdjacentLabel = () => (
  <AtomStoryBackdrop
    className="flex-row items-center gap-3"
    aria-label="Saved: 3"
  >
    <Badge tone="yellow">3</Badge>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Badge",
  parameters: { ladle: { skipCoverage: true } },
};
