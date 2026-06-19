// @ladle-only
import { HeroCard } from "./HeroCard";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <HeroCard className="max-w-sm p-6">
      <h3 className="font-display text-xl uppercase">Card Title</h3>
      <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-60">
        Card body content.
      </p>
    </HeroCard>,
  );

export const Interactive = () =>
  storyBackdrop(
    <HeroCard className="max-w-sm cursor-pointer p-6 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--brand-dark)]">
      <h3 className="font-display text-xl uppercase">Interactive Card</h3>
      <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-60">
        Hover to lift.
      </p>
    </HeroCard>,
  );

export default {
  title: "HeroUI / Card",
  parameters: { ladle: { skipCoverage: true } },
};
