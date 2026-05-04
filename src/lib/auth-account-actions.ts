import { auth } from "@/lib/auth";
import type {
  AuthFormState,
  LoginInput,
  PasswordRecoveryInput,
  SignupInput,
} from "@/lib/auth-forms";
import { createDefaultUserProfile } from "@/lib/auth-profile";

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

export async function signUpWithEmail(
  input: SignupInput,
): Promise<AuthActionResult> {
  try {
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

    return {
      ok: true,
      headers: result.headers,
      userId: result.response.user.id,
      nextPath: input.callbackURL,
      state: successState("Account created.", input.callbackURL),
    };
  } catch {
    return safeErrorState("Unable to create an account with those details.");
  }
}

export async function loginWithEmail(
  input: LoginInput,
): Promise<AuthActionResult> {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
        callbackURL: input.callbackURL,
      },
      returnHeaders: true,
    });

    return {
      ok: true,
      headers: result.headers,
      userId: result.response.user.id,
      nextPath: input.callbackURL ?? result.response.url,
      state: successState(
        "Logged in.",
        input.callbackURL ?? result.response.url,
      ),
    };
  } catch {
    return safeErrorState("Email or password is incorrect.");
  }
}

export async function logout(headers: Headers): Promise<AuthActionResult> {
  try {
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
): Promise<AuthActionResult> {
  try {
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
