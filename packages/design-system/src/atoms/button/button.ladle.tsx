// @atoms-re-export
import { AtomStoryBackdrop } from "../backdrop";

import { Button } from "./button";

export const Default = () => (
  <AtomStoryBackdrop>
    <Button>Default</Button>
  </AtomStoryBackdrop>
);

export const VariantMatrix = () => (
  <AtomStoryBackdrop>
    <Button variant="default">Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="yellow">Yellow</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="muted">Muted</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="link">Link</Button>
  </AtomStoryBackdrop>
);

export const SizeMatrix = () => (
  <AtomStoryBackdrop>
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">Icon</Button>
    <Button size="icon-sm">Icon-sm</Button>
  </AtomStoryBackdrop>
);

export const LoadingState = () => (
  <AtomStoryBackdrop>
    <Button loading>Saving</Button>
    <Button loading variant="secondary">
      Submitting
    </Button>
  </AtomStoryBackdrop>
);

export const AsChildSlot = () => (
  <AtomStoryBackdrop>
    <p className="text-xs font-bold uppercase tracking-widest opacity-60">
      The Button atom no longer exposes an asChild prop; consumers that need an
      anchor use a styled &lt;a&gt; with the same brand chrome.
    </p>
  </AtomStoryBackdrop>
);

export const FocusRing = () => (
  <AtomStoryBackdrop>
    <Button className="focus-visible:ring-4 focus-visible:ring-brand-dark/25">
      Focused
    </Button>
  </AtomStoryBackdrop>
);

export const Variants = () => (
  <AtomStoryBackdrop>
    <Button variant="ghost">Ghost</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="muted">Muted</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="link">Link</Button>
  </AtomStoryBackdrop>
);

export const Sizes = () => (
  <AtomStoryBackdrop>
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
  </AtomStoryBackdrop>
);

export const States = () => (
  <AtomStoryBackdrop>
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Button",
  parameters: { ladle: { skipCoverage: true } },
};
