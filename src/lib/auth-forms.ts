export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type AuthFormStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unauthenticated"
  | "forbidden";

export type AuthFormState<T extends string = string> = {
  status: AuthFormStatus;
  disabled: boolean;
  message?: string;
  fieldErrors?: FieldErrors<T>;
  nextPath?: string;
};

export type SignupInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  callbackURL?: string;
};

export type LoginInput = {
  email: string;
  password: string;
  callbackURL?: string;
};

export type PasswordRecoveryInput = {
  email: string;
  redirectTo?: string;
};

type SignupField = keyof SignupInput;
type LoginField = keyof LoginInput;
type PasswordRecoveryField = keyof PasswordRecoveryInput;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 8;

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  disabled: false,
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalUrl(value: unknown) {
  const text = cleanString(value);
  if (!text) return undefined;
  return text.startsWith("/") || text.startsWith("http") ? text : undefined;
}

async function readJsonObject(request: Request) {
  try {
    const body = await request.json();
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export async function readSignupInput(request: Request) {
  return validateSignupInput(await readJsonObject(request));
}

export async function readLoginInput(request: Request) {
  return validateLoginInput(await readJsonObject(request));
}

export async function readPasswordRecoveryInput(request: Request) {
  return validatePasswordRecoveryInput(await readJsonObject(request));
}

export function validateSignupInput(
  input: Record<string, unknown>,
):
  | { ok: true; data: SignupInput }
  | { ok: false; state: AuthFormState<SignupField> } {
  const data: SignupInput = {
    email: cleanString(input.email).toLowerCase(),
    password: cleanString(input.password),
    firstName: cleanString(input.firstName),
    lastName: cleanString(input.lastName),
    callbackURL: cleanOptionalUrl(input.callbackURL),
  };
  const fieldErrors: FieldErrors<SignupField> = {};

  if (!emailPattern.test(data.email))
    fieldErrors.email = "Enter a valid email.";
  if (data.password.length < minPasswordLength) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }
  if (!data.firstName) fieldErrors.firstName = "First name is required.";
  if (!data.lastName) fieldErrors.lastName = "Last name is required.";

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      state: {
        status: "error",
        disabled: false,
        message: "Check the highlighted fields.",
        fieldErrors,
      },
    };
  }

  return { ok: true, data };
}

export function validateLoginInput(
  input: Record<string, unknown>,
):
  | { ok: true; data: LoginInput }
  | { ok: false; state: AuthFormState<LoginField> } {
  const data: LoginInput = {
    email: cleanString(input.email).toLowerCase(),
    password: cleanString(input.password),
    callbackURL: cleanOptionalUrl(input.callbackURL),
  };
  const fieldErrors: FieldErrors<LoginField> = {};

  if (!emailPattern.test(data.email))
    fieldErrors.email = "Enter a valid email.";
  if (!data.password) fieldErrors.password = "Password is required.";

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      state: {
        status: "error",
        disabled: false,
        message: "Check the highlighted fields.",
        fieldErrors,
      },
    };
  }

  return { ok: true, data };
}

export function validatePasswordRecoveryInput(
  input: Record<string, unknown>,
):
  | { ok: true; data: PasswordRecoveryInput }
  | { ok: false; state: AuthFormState<PasswordRecoveryField> } {
  const data: PasswordRecoveryInput = {
    email: cleanString(input.email).toLowerCase(),
    redirectTo: cleanOptionalUrl(input.redirectTo),
  };
  const fieldErrors: FieldErrors<PasswordRecoveryField> = {};

  if (!emailPattern.test(data.email))
    fieldErrors.email = "Enter a valid email.";

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      state: {
        status: "error",
        disabled: false,
        message: "Check the highlighted fields.",
        fieldErrors,
      },
    };
  }

  return { ok: true, data };
}
