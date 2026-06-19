// @ladle-only

import { HeroButton } from "./HeroButton";
import { HeroMenu, HeroMenuContent, HeroMenuTrigger } from "./HeroMenu";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <HeroMenu>
      <HeroMenuTrigger>
        <HeroButton>Open Menu</HeroButton>
      </HeroMenuTrigger>
      <HeroMenuContent>
        <ul className="min-w-[140px] space-y-1">
          <li className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-brand-yellow">
            Edit
          </li>
          <li className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-brand-yellow">
            Duplicate
          </li>
          <li className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-brand-error hover:text-white">
            Delete
          </li>
        </ul>
      </HeroMenuContent>
    </HeroMenu>,
  );

export default {
  title: "HeroUI / Menu",
  parameters: { ladle: { skipCoverage: true } },
};
