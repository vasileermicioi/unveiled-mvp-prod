// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { Tab, Tabs } from "./tabs";

export const KeyboardArrowNavigation = () => (
  <AtomStoryBackdrop>
    <Tabs aria-label="Arrow-key navigation">
      <Tab key="alpha" title="Alpha">
        <p>Alpha content</p>
      </Tab>
      <Tab key="beta" title="Beta">
        <p>Beta content</p>
      </Tab>
      <Tab key="gamma" title="Gamma">
        <p>Gamma content</p>
      </Tab>
    </Tabs>
  </AtomStoryBackdrop>
);

export const ActivePanelVisibility = () => (
  <AtomStoryBackdrop>
    <Tabs aria-label="Active panel visibility" defaultSelectedKey="beta">
      <Tab key="alpha" title="Alpha">
        <p>Alpha content</p>
      </Tab>
      <Tab key="beta" title="Beta">
        <p>Beta content is visible by default</p>
      </Tab>
    </Tabs>
  </AtomStoryBackdrop>
);

export const Default = () => (
  <AtomStoryBackdrop>
    <Tabs aria-label="Unveiled tabs">
      <Tab key="overview" title="Overview">
        <p>Overview content</p>
      </Tab>
      <Tab key="details" title="Details">
        <p>Details content</p>
      </Tab>
    </Tabs>
  </AtomStoryBackdrop>
);

export const Variant = () => (
  <AtomStoryBackdrop>
    <Tabs aria-label="Disabled tab" disabledKeys={["details"]}>
      <Tab key="overview" title="Overview">
        <p>Overview content</p>
      </Tab>
      <Tab key="details" title="Details">
        <p>Details content (disabled)</p>
      </Tab>
    </Tabs>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Tabs",
  parameters: { ladle: { skipCoverage: true } },
};
