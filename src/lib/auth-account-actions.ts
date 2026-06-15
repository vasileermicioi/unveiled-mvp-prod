import { createAuth } from "@/lib/auth";
import type {
  AuthFormState,
  LoginInput,
  PasswordRecoveryInput,
  SignupInput,
} from "@/lib/auth-forms";
import {
  createDefaultUserProfile,
  getAuthRedirectPath,
  getViewer,
} from "@/lib/auth-profile";
import type { RuntimeEnv } from "@/lib/env";
import { mapAuthError } from "@/lib/i18n";

export type AuthActionSuccess = {
  ok: true;
  state: AuthFormState;
  headers: Headers;
  userId?: string;
  nextPath?: string;
};

export type AuthActionFailure = {
  ok: false;
  state: AuthFormState;
  status: number;
  headers?: Headers;
};

export type AuthActionResult = AuthActionSuccess | AuthActionFailure;

function safeErrorState(message = "The request could not be completed.") {
  return {
    ok: false,
    status: 400,
    state: {
      status: "error",
      disabled: false,
      message,
    },
  } satisfies AuthActionFailure;
}

export function readAuthErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const candidate = error as {
    body?: { code?: unknown; message?: unknown };
    code?: unknown;
  };
  const code = candidate.body?.code ?? candidate.code;
  return typeof code === "string" ? code : null;
}

function successState(message: string, nextPath?: string) {
  return {
    status: "success",
    disabled: false,
    message,
    nextPath,
  } satisfies AuthFormState;
}

function getName(input: SignupInput) {
  return `${input.firstName} ${input.lastName}`.trim();
}

function getSetCookieValues(headers: Headers | undefined) {
  if (!headers) return [];

  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  const values = getSetCookie ? getSetCookie.call(headers) : [];
  const fallback = headers.get("set-cookie");

  return values.length ? values : fallback ? [fallback] : [];
}

export function headersWithSetCookieAsCookie(headers: Headers) {
  const requestHeaders = new Headers(headers);
  const cookie = getSetCookieValues(headers)
    .map((value) => value.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");

  if (cookie) requestHeaders.set("cookie", cookie);

  return requestHeaders;
}

export async function signUpWithEmail(
  input: SignupInput,
  env?: RuntimeEnv,
  language?: string,
): Promise<AuthActionResult> {
  try {
    const auth = createAuth(env);
    const result = await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: getName(input),
        callbackURL: input.callbackURL,
      },
      returnHeaders: true,
    });

    await createDefaultUserProfile({
      userId: result.response.user.id,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const viewer = await getViewer(
      headersWithSetCookieAsCookie(result.headers),
    );
    const nextPath =
      viewer.kind === "authenticated"
        ? getAuthRedirectPath(viewer, input.callbackURL)
        : (input.callbackURL ?? undefined);

    return {
      ok: true,
      headers: result.headers,
      userId: result.response.user.id,
      nextPath,
      state: successState("Account created.", nextPath),
    };
  } catch (error) {
    return safeErrorState(mapAuthError(readAuthErrorCode(error), language));
  }
}

export async function loginWithEmail(
  input: LoginInput,
  env?: RuntimeEnv,
  language?: string,
): Promise<AuthActionResult> {
  try {
    const auth = createAuth(env);
    const result = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
        callbackURL: input.callbackURL,
      },
      returnHeaders: true,
    });

    const viewer = await getViewer(
      headersWithSetCookieAsCookie(result.headers),
    );
    const nextPath =
      viewer.kind === "authenticated"
        ? getAuthRedirectPath(viewer, input.callbackURL)
        : (input.callbackURL ?? result.response.url ?? undefined);

    return {
      ok: true,
      headers: result.headers,
      userId: result.response.user.id,
      nextPath,
      state: successState("Logged in.", nextPath),
    };
  } catch (error) {
    return safeErrorState(mapAuthError(readAuthErrorCode(error), language));
  }
}

export async function logout(
  headers: Headers,
  env?: RuntimeEnv,
  language?: string,
): Promise<AuthActionResult> {
  try {
    const auth = createAuth(env);
    const result = await auth.api.signOut({
      headers,
      returnHeaders: true,
    });

    return {
      ok: true,
      headers: result.headers,
      state: successState("Logged out.", "/"),
      nextPath: "/",
    };
  } catch (error) {
    return safeErrorState(mapAuthError(readAuthErrorCode(error), language));
  }
}

export async function requestPasswordRecovery(
  input: PasswordRecoveryInput,
  env?: RuntimeEnv,
): Promise<AuthActionResult> {
  try {
    const auth = createAuth(env);
    await auth.api.requestPasswordReset({
      body: {
        email: input.email,
        redirectTo: input.redirectTo,
      },
    });
  } catch {
    // Keep the response safe and non-enumerating.
  }

  return {
    ok: true,
    headers: new Headers(),
    state: successState(
      "If an account exists for that email, recovery instructions will be sent.",
    ),
  };
}
