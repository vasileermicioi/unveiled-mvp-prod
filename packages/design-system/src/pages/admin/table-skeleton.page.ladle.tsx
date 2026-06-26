import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { TableSkeletonPresentational } from "../../organisms/_shared/table-skeleton/table-skeleton";
import { makeMockTableSkeletonProps } from "../../organisms/_shared/table-skeleton/table-skeleton.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Table skeleton
        </h1>
      ),
      pageBody: (
        <div className="space-y-8">
          <TableSkeletonPresentational {...makeMockTableSkeletonProps()} />
          <TableSkeletonPresentational
            {...makeMockTableSkeletonProps({
              columns: 6,
              rows: 6,
              density: "compact",
              label: "Loading admin rows (compact)",
            })}
          />
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Admin / Table skeleton",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
