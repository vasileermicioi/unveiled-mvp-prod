import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { AdminFreezeUnfreezeFormPresentational } from "../../organisms/payments/admin-freeze-unfreeze-form/admin-freeze-unfreeze-form";
import { makeMockAdminFreezeUnfreezeFormProps } from "../../organisms/payments/admin-freeze-unfreeze-form/admin-freeze-unfreeze-form.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Freeze / Unfreeze account
        </h1>
      ),
      pageBody: (
        <AdminFreezeUnfreezeFormPresentational
          {...makeMockAdminFreezeUnfreezeFormProps()}
        />
      ),
    })}
  />
);

export default {
  title: "Pages / Payments / Admin freeze unfreeze",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
