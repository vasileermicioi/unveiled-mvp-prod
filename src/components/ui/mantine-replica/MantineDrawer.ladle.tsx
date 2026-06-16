// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { useState } from "react";
import { MantineDrawer } from "@/components/ui/mantine-replica/MantineDrawer";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

function WithState({
  position,
  withForm,
}: {
  position: "left" | "right";
  withForm?: boolean;
}) {
  const [opened, setOpened] = useState(true);
  return (
    <MantineDrawer
      opened={opened}
      onClose={() => setOpened(false)}
      position={position}
      withForm={withForm}
      title={`Drawer ${position}`}
    >
      {withForm ? (
        <input
          placeholder="Name"
          className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
        />
      ) : (
        <p>Drawer body content</p>
      )}
    </MantineDrawer>
  );
}

export default {
  title: "Mantine Replica / Drawer",
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

export const Left: Story = () => <WithState position="left" />;
export const Right: Story = () => <WithState position="right" />;
export const WithForm: Story = () => <WithState position="right" withForm />;
