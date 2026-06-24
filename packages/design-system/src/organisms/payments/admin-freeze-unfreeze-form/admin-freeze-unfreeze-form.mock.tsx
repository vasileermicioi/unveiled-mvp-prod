import type {
  AdminFreezeUnfreezeFormCopy,
  AdminFreezeUnfreezeFormProps,
} from "./admin-freeze-unfreeze-form";

export function makeMockAdminFreezeUnfreezeFormProps(
  overrides: Partial<AdminFreezeUnfreezeFormProps> = {},
): AdminFreezeUnfreezeFormProps {
  const copy: AdminFreezeUnfreezeFormCopy = {
    reasonLabel: "Reason",
    reasonPlaceholder: "Why are you freezing this account?",
    freezeSubmit: "Freeze account",
    unfreezeSubmit: "Unfreeze account",
    errorInvalidReason: "Reason cannot be empty.",
  };
  return {
    copy,
    reason: "",
    busy: false,
    errorText: "",
    formId: "admin-freeze-unfreeze-form-mock",
    reasonInputId: "reason-input-mock",
    errorRegionId: "error-region-mock",
    onReasonChange: () => undefined,
    onSubmit: () => undefined,
    onFormSubmit: () => undefined,
    ...overrides,
  };
}
