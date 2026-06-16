// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { useState } from "react";
import { MantineModal } from "@/components/ui/mantine-replica/MantineModal";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

function WithState({
  size,
  withForm,
  withFooter,
}: {
  size: "sm" | "md" | "lg";
  withForm?: boolean;
  withFooter?: boolean;
}) {
  const [opened, setOpened] = useState(true);
  return (
    <MantineModal
      opened={opened}
      onClose={() => setOpened(false)}
      title={`Size ${size}`}
      size={size}
      withFooter={withFooter}
      withForm={withForm}
    >
      {withForm ? (
        <>
          <input
            placeholder="Name"
            className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
          />
          <input
            placeholder="Email"
            className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
          />
        </>
      ) : (
        <p>Modal body content</p>
      )}
    </MantineModal>
  );
}

export default {
  title: "Mantine Replica / Modal",
  decorators: [
    (StoryFn: () => React.ReactNode) => (
      <MantineReplicaProvider>
        <div className="bg-brand-grey p-6">
          <div className="unveiled-shadow border-4 border-brand-dark bg-white p-6">
            <StoryFn />
          </div>
        </div>
      </MantineReplicaProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    ladle: {
      skipCoverage: true,
    },
  },
};

export const Small: Story = () => <WithState size="sm" />;
export const Medium: Story = () => <WithState size="md" />;
export const Large: Story = () => <WithState size="lg" />;
export const WithForm: Story = () => <WithState size="md" withForm />;
export const WithFooter: Story = () => <WithState size="md" withFooter />;
