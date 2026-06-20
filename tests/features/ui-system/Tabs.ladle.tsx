// @ladle-only
import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { Tab, Tabs } from "@unveiled/design-system";

export const KeyboardArrowNavigation: Story = () => (
  <div className="bg-brand-grey p-8">
    <Tabs aria-label="Event views" defaultSelectedKey="upcoming">
      <Tab key="upcoming" title="Upcoming" />
      <Tab key="saved" title="Saved" />
    </Tabs>
  </div>
);

export const ActivePanelVisibility: Story = () => (
  <div className="bg-brand-grey p-8">
    <Tabs aria-label="Event views" defaultSelectedKey="upcoming">
      <Tab key="upcoming" title="Upcoming">
        <section aria-label="Upcoming events">Upcoming content</section>
      </Tab>
      <Tab key="saved" title="Saved">
        Saved content
      </Tab>
    </Tabs>
  </div>
);

export default {
  title: "ui-system / Tabs",
};
