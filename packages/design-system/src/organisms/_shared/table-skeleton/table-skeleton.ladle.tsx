import { TableSkeletonPresentational } from "./table-skeleton";
import { makeMockTableSkeletonProps } from "./table-skeleton.mock";

export const Default = () => (
  <div className="space-y-6 bg-brand-grey p-8">
    <TableSkeletonPresentational {...makeMockTableSkeletonProps()} />
  </div>
);

export const Dense = () => (
  <div className="space-y-6 bg-brand-grey p-8">
    <TableSkeletonPresentational
      {...makeMockTableSkeletonProps({
        columns: 6,
        rows: 6,
        density: "compact",
        label: "Loading admin rows (compact)",
      })}
    />
  </div>
);

export default {
  title: "Organisms / Shared / Table skeleton",
};
