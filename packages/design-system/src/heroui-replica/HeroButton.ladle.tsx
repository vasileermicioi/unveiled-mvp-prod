// @ladle-only
import { Button } from "@nextui-org/react";

import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <div className="flex flex-wrap gap-4">
      <Button className="rounded-none border-2 border-brand-dark bg-brand-dark text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-brand-yellow hover:text-brand-dark">
        Primary
      </Button>
      <Button className="rounded-none border-2 border-brand-dark bg-white text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark hover:bg-brand-yellow">
        Secondary
      </Button>
      <Button className="rounded-none border-2 border-brand-dark bg-brand-yellow text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark hover:bg-white">
        Yellow
      </Button>
      <Button
        isDisabled
        className="rounded-none border-2 border-brand-dark bg-brand-dark text-[10px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-35"
      >
        Disabled
      </Button>
    </div>,
  );

export const Sizes = () =>
  storyBackdrop(
    <div className="flex flex-wrap items-center gap-4">
      <Button
        size="sm"
        className="rounded-none border-2 border-brand-dark bg-brand-dark text-[9px] font-black uppercase tracking-[0.18em] text-white"
      >
        Small
      </Button>
      <Button
        size="md"
        className="rounded-none border-2 border-brand-dark bg-brand-dark text-[10px] font-black uppercase tracking-[0.18em] text-white"
      >
        Medium
      </Button>
      <Button
        size="lg"
        className="rounded-none border-2 border-brand-dark bg-brand-dark text-xs font-black uppercase tracking-[0.18em] text-white"
      >
        Large
      </Button>
    </div>,
  );

export const Loading = () =>
  storyBackdrop(
    <Button
      isLoading
      className="rounded-none border-2 border-brand-dark bg-brand-dark px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
    >
      Loading
    </Button>,
  );

export default {
  title: "HeroUI / Button",
  parameters: { ladle: { skipCoverage: true } },
};
