// @ladle-only
import { HeroStatPanel } from "./HeroStatPanel";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <HeroStatPanel
      label="Total bookings"
      value="1,248"
      caption="+12% this month"
    />,
  );

export const WithoutCaption = () =>
  storyBackdrop(<HeroStatPanel label="Attendees" value="482" />);

export default {
  title: "HeroUI / StatPanel",
  parameters: { ladle: { skipCoverage: true } },
};
