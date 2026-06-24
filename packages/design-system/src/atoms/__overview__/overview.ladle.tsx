// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { Button } from "../button";
import { Card } from "../card";
import { Divider } from "../divider";
import { SelectItem } from "../select-item";
import { Tab, Tabs } from "../tabs";
import { TextArea } from "../text-area";
import { TextInput } from "../text-input";

export const Overview = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <main
      aria-label="Atoms overview"
      className="grid min-h-screen gap-6 bg-brand-grey p-8"
    >
      <h1 className="font-display text-3xl font-black uppercase tracking-widest">
        Atoms overview
      </h1>
      <p className="text-sm font-bold uppercase tracking-widest opacity-60">
        Every atom in the design-system layer, mounted with mock data.
      </p>

      <section aria-label="Buttons" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          Button
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="yellow">Yellow</Button>
          <Button variant="destructive">Destructive</Button>
          <Button loading>Loading</Button>
        </div>
      </section>

      <Divider />

      <section aria-label="Cards" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          Card
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-5">
            <p className="font-display text-sm uppercase">Static card</p>
          </Card>
          <Card interactive className="p-5">
            <p className="font-display text-sm uppercase">Interactive</p>
          </Card>
        </div>
      </section>

      <Divider />

      <section aria-label="Inputs" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          Inputs
        </h2>
        <TextInput placeholder="TextInput" aria-label="TextInput" />
        <TextArea placeholder="TextArea" aria-label="TextArea" />
      </section>

      <Divider />

      <section aria-label="Tabs and select item" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          Tabs / SelectItem
        </h2>
        <Tabs aria-label="Overview tabs">
          <Tab key="alpha" title="Alpha">
            <p>Alpha content</p>
          </Tab>
          <Tab key="beta" title="Beta">
            <p>Beta content</p>
          </Tab>
        </Tabs>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60">
          SelectItem: <SelectItem key="x">X</SelectItem>
        </p>
      </section>
    </main>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Overview",
  parameters: { ladle: { skipCoverage: true } },
};
