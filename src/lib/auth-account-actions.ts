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
        : input.callbackURL;

    return {
      ok: true,
      headers: result.headers,
      userId: result.response.user.id,
      nextPath,
      state: successState("Account created.", nextPath),
    };
  } catch {
    return safeErrorState("Unable to create an account with those details.");
  }
}

export async function loginWithEmail(
  input: LoginInput,
  env?: RuntimeEnv,
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
        : (input.callbackURL ?? result.response.url);

    return {
      ok: true,
      headers: result.headers,
      userId: result.response.user.id,
      nextPath,
      state: successState("Logged in.", nextPath),
    };
  } catch {
    return safeErrorState("Email or password is incorrect.");
  }
}

export async function logout(
  headers: Headers,
  env?: RuntimeEnv,
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
  } catch {
    return safeErrorState("Unable to log out.");
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
