// @atoms-re-export
import { AtomStoryBackdrop } from "../../atoms/backdrop";

import { StatPanel } from "./stat-panel";

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <StatPanel label="Tickets sold" value="1,284" />
  </AtomStoryBackdrop>
);

export const WithCaption = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <StatPanel label="This week" value="42" caption="Up 12% from last week" />
  </AtomStoryBackdrop>
);

export const VariantMatrix = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <StatPanel label="Revenue" value="$9,420" caption="Net" />
    <StatPanel label="Refunds" value="$120" caption="Last 7 days" />
  </AtomStoryBackdrop>
);

export default {
  title: "Molecules / StatPanel",
  parameters: { ladle: { skipCoverage: true } },
};
