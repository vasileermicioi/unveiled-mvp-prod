import type { z } from "zod";

export type FieldErrors = Record<string, string>;
export type QueryInvalidationKey = readonly unknown[];

export type ActionNotice = {
  type: "success" | "info";
  message: string;
};

export type FormActionSuccess<TData = undefined> = {
  ok: true;
  fieldErrors?: never;
  formError?: never;
  notice?: ActionNotice;
  data?: TData;
  invalidate?: QueryInvalidationKey[];
};

export type FormActionFailure = {
  ok: false;
  fieldErrors?: FieldErrors;
  formError?: string;
  notice?: never;
  data?: never;
  invalidate?: never;
};

export type FormActionResult<TData = undefined> =
  | FormActionSuccess<TData>
  | FormActionFailure;

export type ParsedFormInput<TData> =
  | { ok: true; data: TData }
  | FormActionFailure;

export function fieldPathFromIssue(issue: z.core.$ZodIssue) {
  return issue.path.map(String).join(".");
}

export function fieldErrorsFromZodError(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const path = fieldPathFromIssue(issue);
    if (!path) continue;
    fieldErrors[path] ??= issue.message;
  }

  return fieldErrors;
}

export function validationFailure(error: z.ZodError): FormActionFailure {
  return {
    ok: false,
    fieldErrors: fieldErrorsFromZodError(error),
    formError: "Check the highlighted fields.",
  };
}

export function formFailure(formError: string): FormActionFailure {
  return {
    ok: false,
    formError,
  };
}

export function actionSuccess<TData = undefined>(
  input: Omit<FormActionSuccess<TData>, "ok"> = {},
): FormActionSuccess<TData> {
  return {
    ok: true,
    ...input,
  };
}

export function parseFormInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): ParsedFormInput<z.infer<TSchema>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  return { ok: true, data: parsed.data };
}
