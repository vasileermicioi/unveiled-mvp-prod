import type { QueryClient } from "@tanstack/react-query";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { QueryInvalidationHint } from "@/lib/data-access/invalidation";
import type {
  FormActionResult,
  QueryInvalidationKey,
} from "@/lib/forms/action-result";

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
    await invalidateActionQueries(options.queryClient, result.invalidate);
  }

  return result;
}

export async function invalidateActionQueries(
  queryClient: Pick<QueryClient, "invalidateQueries">,
  invalidate: Array<QueryInvalidationKey | QueryInvalidationHint>,
) {
  await Promise.all(
    invalidate.map((entry) => {
      const hint =
        typeof entry === "object" &&
        entry !== null &&
        "queryKey" in entry &&
        Array.isArray(entry.queryKey)
          ? (entry as QueryInvalidationHint)
          : undefined;
      return queryClient.invalidateQueries({
        queryKey: hint?.queryKey ?? (entry as QueryInvalidationKey),
        exact: hint?.exact,
      });
    }),
  );
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
