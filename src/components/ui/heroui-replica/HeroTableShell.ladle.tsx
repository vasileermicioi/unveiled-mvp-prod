// @ladle-only
import { HeroTableRow, HeroTableShell } from "./HeroTableShell";
import { storyBackdrop } from "./story-backdrop";

export const ShellAndRow = () =>
  storyBackdrop(
    <HeroTableShell>
      <HeroTableRow>
        <span className="font-bold">Event Name</span>
        <span className="text-sm opacity-60">Date</span>
        <span className="text-sm opacity-60">Status</span>
        <span className="text-right text-sm font-bold">Action</span>
      </HeroTableRow>
      <HeroTableRow>
        <span className="font-bold">Jazz Night</span>
        <span className="text-sm opacity-60">Jun 20</span>
        <span className="text-sm opacity-60">Live</span>
        <span className="text-right text-sm font-bold">Edit</span>
      </HeroTableRow>
    </HeroTableShell>,
  );

export default {
  title: "HeroUI / TableShell",
  parameters: { ladle: { skipCoverage: true } },
};
