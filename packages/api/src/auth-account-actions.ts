import type {
  AuthFormState,
  LoginInput,
  PasswordRecoveryInput,
  SignupInput,
} from "@unveiled/api/auth-forms";
import {
  createDefaultUserProfile as createDomainProfile,
  getAuthRedirectPath,
  getViewer,
} from "@unveiled/api/auth-profile";
import type { RuntimeEnv } from "@unveiled/api/env";
import { mapAuthError } from "@unveiled/api/i18n";
import { createAuth } from "@unveiled/api/middleware/auth";

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

export type ResponseInitHeaders = {
  headers: Record<string, string | string[]>;
  status: 200 | 400 | 401 | 403;
};

function getSetCookieValues(headers: Headers): string[] {
  const candidate = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof candidate.getSetCookie === "function") {
    return candidate.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

export function headersToResponseInit(
  headers: Headers | undefined,
  fallbackStatus: 200 | 400 | 401 | 403 = 200,
): ResponseInitHeaders {
  const source = headers ?? new Headers();
  const record: Record<string, string | string[]> = {};
  source.forEach((value, key) => {
    const lower = key.toLowerCase();
    const existing = record[lower];
    if (existing === undefined) {
      record[lower] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      record[lower] = [existing, value];
    }
  });
  const setCookies = getSetCookieValues(source);
  if (setCookies.length > 0) {
    record["set-cookie"] = setCookies.length === 1 ? setCookies[0] : setCookies;
  }
  if (!record["content-type"]) {
    record["content-type"] = "application/json";
  }
  return { headers: record, status: fallbackStatus };
}

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

    await createDomainProfile({
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
