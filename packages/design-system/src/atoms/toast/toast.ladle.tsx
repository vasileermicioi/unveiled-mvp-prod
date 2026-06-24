// @atoms-re-export
import { Alert } from "@nextui-org/react";

import { AtomStoryBackdrop } from "../backdrop";

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Alert
      title="Heads up"
      description="This is a default toast."
      classNames={{
        base: "rounded-none border-4 border-brand-dark bg-white unveiled-shadow",
        title: "font-display uppercase",
        description: "text-xs font-bold uppercase tracking-widest opacity-60",
      }}
    />
  </AtomStoryBackdrop>
);

export const Success = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Alert
      color="success"
      title="Saved"
      description="Your changes were saved."
      classNames={{
        base: "rounded-none border-4 border-brand-dark bg-white unveiled-shadow",
        title: "font-display uppercase",
        description: "text-xs font-bold uppercase tracking-widest opacity-60",
      }}
    />
  </AtomStoryBackdrop>
);

export const Danger = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Alert
      color="danger"
      title="Error"
      description="Something went wrong."
      classNames={{
        base: "rounded-none border-4 border-brand-dark bg-white unveiled-shadow",
        title: "font-display uppercase",
        description: "text-xs font-bold uppercase tracking-widest opacity-60",
      }}
    />
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Toast",
  parameters: { ladle: { skipCoverage: true } },
};
