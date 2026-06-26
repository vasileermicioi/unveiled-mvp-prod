import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";

import { TableSkeletonPresentational } from "@unveiled/design-system";

function TableSkeletonStoryHarness({
  columns,
  rows,
  density,
  label,
}: {
  columns: number;
  rows: number;
  density?: "comfortable" | "compact";
  label: string;
}) {
  return (
    <main className="grid gap-4 bg-brand-grey p-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight text-brand-dark">
        Admin loading state
      </h1>
      <p className="text-sm font-medium text-brand-dark/70">{label}</p>
      <TableSkeletonPresentational
        columns={columns}
        rows={rows}
        density={density}
        label={label}
      />
    </main>
  );
}

export default {
  title: "AdminLoadingState",
  parameters: { layout: "fullscreen" },
};

export const Default: Story = () => (
  <TableSkeletonStoryHarness
    columns={6}
    rows={4}
    label="Loading admin events"
  />
);

export const Dense: Story = () => (
  <TableSkeletonStoryHarness
    columns={2}
    rows={4}
    density="compact"
    label="Loading admin partners"
  />
);