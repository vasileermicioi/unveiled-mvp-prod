import { AdminFreezeUnfreezeFormPresentational } from "./admin-freeze-unfreeze-form";
import { makeMockAdminFreezeUnfreezeFormProps } from "./admin-freeze-unfreeze-form.mock";

export const Default = () => (
  <AdminFreezeUnfreezeFormPresentational
    {...makeMockAdminFreezeUnfreezeFormProps()}
  />
);

export const WithReason = () => (
  <AdminFreezeUnfreezeFormPresentational
    {...makeMockAdminFreezeUnfreezeFormProps({ reason: "Chargeback dispute" })}
  />
);

export const Submitting = () => (
  <AdminFreezeUnfreezeFormPresentational
    {...makeMockAdminFreezeUnfreezeFormProps({ busy: true })}
  />
);

export const WithError = () => (
  <AdminFreezeUnfreezeFormPresentational
    {...makeMockAdminFreezeUnfreezeFormProps({
      errorText: "Reason cannot be empty.",
    })}
  />
);

export default {
  title: "Organisms / Payments / Admin Freeze Unfreeze Form",
  parameters: { ladle: { skipCoverage: true } },
};
