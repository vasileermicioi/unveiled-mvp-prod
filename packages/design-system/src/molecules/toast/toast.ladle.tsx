// @atoms-re-export
import { useState } from "react";

import { AtomStoryBackdrop } from "../../atoms/backdrop";
import { Button } from "../../atoms/button";

import { Toast, ToastProvider, useToast } from "./toast";

function TriggerSuccess() {
  const { success } = useToast();
  return (
    <Button variant="primary" onClick={() => success("Saved", "All set")}>
      Fire success toast
    </Button>
  );
}

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Toast title="Heads up" description="This is a default toast." />
  </AtomStoryBackdrop>
);

export const Tones = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Toast title="Default" tone="default" />
    <Toast title="Success" tone="success" />
    <Toast title="Warning" tone="warning" />
    <Toast title="Danger" tone="danger" />
  </AtomStoryBackdrop>
);

export const SuccessTone = () => <Toast title="Saved" tone="success" />;

export const ErrorTone = () => <Toast title="Failed" tone="danger" />;

export const ProviderWithTrigger = () => {
  const [mounted, setMounted] = useState(true);
  if (!mounted)
    return <Button onClick={() => setMounted(true)}>Mount provider</Button>;
  return (
    <ToastProvider>
      <div className="grid gap-3">
        <TriggerSuccess />
        <Button variant="secondary" onClick={() => setMounted(false)}>
          Unmount
        </Button>
      </div>
    </ToastProvider>
  );
};

export default {
  title: "Molecules / Toast",
  parameters: { ladle: { skipCoverage: true } },
};
