// @atoms-re-export
import type { ReactNode } from "react";

import { AtomStoryBackdrop } from "../../atoms/backdrop";
import { Button } from "../../atoms/button";
import { TextInput } from "../../atoms/text-input";

import { Field } from "../field";
import { StatPanel } from "../stat-panel";
import { StatePanel } from "../state-panel";

export const Overview = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <main
      aria-label="Molecules overview"
      className="grid min-h-screen gap-6 bg-brand-grey p-8"
    >
      <h1 className="font-display text-3xl font-black uppercase tracking-widest">
        Molecules overview
      </h1>
      <p className="text-sm font-bold uppercase tracking-widest opacity-60">
        Every molecule in the design-system layer, mounted with mock data.
      </p>

      <section aria-label="Field" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          Field
        </h2>
        <Field label="Email" htmlFor="mol-email">
          <TextInput id="mol-email" placeholder="you@example.com" />
        </Field>
        <Field
          label="Display name"
          htmlFor="mol-name"
          helper="Visible to other members"
        >
          <TextInput id="mol-name" placeholder="Pat" />
        </Field>
      </section>

      <section aria-label="StatePanel" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          StatePanel
        </h2>
        <StatePanel
          title="Nothing here yet"
          text="When you create something, it will show up here."
        />
      </section>

      <section aria-label="StatPanel" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          StatPanel
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatPanel label="Tickets sold" value="1,284" />
          <StatPanel
            label="This week"
            value="42"
            caption="Up 12% from last week"
          />
        </div>
      </section>

      <section aria-label="Actions" className="grid gap-3">
        <h2 className="font-display text-lg font-black uppercase tracking-widest">
          Modal / Drawer / Menu
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Open modal</Button>
          <Button variant="secondary">Open drawer</Button>
          <Button variant="secondary">Open menu</Button>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60">
          (Triggers for Modal, Drawer, and Menu live in their per-molecule
          stories — the molecules layer is composed of atoms that wrap HeroUI
          primitives, per the design-system contract.)
        </p>
        <Button variant="primary">Primary action</Button>
      </section>

      <p className="text-xs font-bold uppercase tracking-widest opacity-60">
        Toast: <span className="text-brand-dark">see Molecules / Toast</span>
      </p>
    </main>
    <span hidden>{"" as ReactNode}</span>
  </AtomStoryBackdrop>
);

export default {
  title: "Molecules / Overview",
  parameters: { ladle: { skipCoverage: true } },
};
