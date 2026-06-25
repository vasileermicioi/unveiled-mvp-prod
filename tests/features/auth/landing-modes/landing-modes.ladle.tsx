// @ladle-only
import type { Story } from "@ladle/react";
import { useId, useState } from "react";

import "@unveiled/app/styles/global.css";

import {
  LoginFormPresentational,
  type LoginFormValues,
  SignupFormPresentational,
  type SignupFormValues,
} from "@unveiled/design-system";

function GuestLandingForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loginValues, setLoginValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    redirect: null,
  });
  const [signupValues, setSignupValues] = useState<SignupFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  return (
    <main className="grid place-items-center bg-brand-grey p-8">
      <div className="grid w-full max-w-md gap-6 rounded-md border-4 border-brand-dark bg-white p-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-brand-dark">
          Become a member
        </h1>
        {mode === "login" ? (
          <LoginFormPresentational
            copy={{
              title: "Welcome back",
              email: "Email",
              emailPlaceholder: "you@example.com",
              password: "Password",
              passwordPlaceholder: "••••••••",
              submit: "Log in",
              forgotPassword: "Forgot password?",
              createAccount: "Become a member",
            }}
            values={loginValues}
            formId={useId()}
            onChange={setLoginValues}
            onSubmit={() => undefined}
          />
        ) : (
          <SignupFormPresentational
            copy={{
              title: "Create access",
              firstName: "First name",
              firstNamePlaceholder: "Alex",
              lastName: "Last name",
              lastNamePlaceholder: "Morgan",
              email: "Email",
              emailPlaceholder: "you@example.com",
              password: "Password",
              passwordPlaceholder: "••••••••",
              submit: "Start membership",
              helper: "Membership unlocks curated invitations.",
              switchToLogin: "Already a member? Log in",
            }}
            values={signupValues}
            formId={useId()}
            onChange={setSignupValues}
            onSubmit={() => undefined}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </main>
  );
}

export default {
  title: "LandingModes",
  parameters: { layout: "fullscreen" },
};

export const Guest: Story = () => <GuestLandingForm initialMode="signup" />;

export const SignedIn: Story = () => (
  <main className="grid place-items-center bg-brand-grey p-8">
    <div className="grid max-w-md gap-4 rounded-md border-4 border-brand-dark bg-brand-cream p-6 text-center">
      <p className="text-2xl font-black uppercase tracking-tight">
        Redirecting…
      </p>
      <p className="text-sm font-bold uppercase tracking-widest opacity-60">
        You're already signed in. Continuing to your member area.
      </p>
      <a
        id="signed-in-redirect-continue"
        href="/app/en/app"
        className="rounded-md border-2 border-brand-dark bg-brand-yellow px-3 py-2 text-sm font-bold uppercase tracking-widest text-brand-dark"
      >
        Continue
      </a>
    </div>
  </main>
);

export const SignedInAsPartner: Story = () => (
  <main className="grid place-items-center bg-brand-grey p-8">
    <div className="grid max-w-md gap-4 rounded-md border-4 border-brand-dark bg-brand-cream p-6 text-center">
      <p className="text-2xl font-black uppercase tracking-tight">
        Redirecting…
      </p>
      <p className="text-sm font-bold uppercase tracking-widest opacity-60">
        You're signed in as a partner. Continuing to the partner portal.
      </p>
      <a
        id="signed-in-redirect-continue"
        href="/app/en/partner"
        className="rounded-md border-2 border-brand-dark bg-brand-yellow px-3 py-2 text-sm font-bold uppercase tracking-widest text-brand-dark"
      >
        Continue
      </a>
    </div>
  </main>
);