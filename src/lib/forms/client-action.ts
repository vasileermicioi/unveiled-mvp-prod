import type { QueryClient } from "@tanstack/react-query";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import type { FormActionResult } from "@/lib/forms/action-result";

export type ApplyActionResultOptions<TFieldValues extends FieldValues> = {
  form: Pick<UseFormReturn<TFieldValues>, "setError" | "clearErrors">;
  queryClient?: Pick<QueryClient, "invalidateQueries">;
  onFormError?: (message: string) => void;
  onNotice?: (message: string) => void;
};

export async function applyFormActionResult<
  TFieldValues extends FieldValues,
  TData = undefined,
>(
  result: FormActionResult<TData>,
  options: ApplyActionResultOptions<TFieldValues>,
) {
  if (!result.ok) {
    if (result.fieldErrors) {
      for (const [name, message] of Object.entries(result.fieldErrors)) {
        options.form.setError(name as Path<TFieldValues>, {
          type: "server",
          message,
        });
      }
    }
    if (result.formError) options.onFormError?.(result.formError);
    return result;
  }

  options.form.clearErrors();
  if (result.notice?.message) options.onNotice?.(result.notice.message);
  if (options.queryClient && result.invalidate) {
    await Promise.all(
      result.invalidate.map((queryKey) =>
        options.queryClient?.invalidateQueries({ queryKey }),
      ),
    );
  }

  return result;
}

export async function submitFormAction<
  TFieldValues extends FieldValues,
  TData = undefined,
>(
  submit: () => Promise<FormActionResult<TData>>,
  options: ApplyActionResultOptions<TFieldValues>,
) {
  const result = await submit();
  return applyFormActionResult(result, options);
}
