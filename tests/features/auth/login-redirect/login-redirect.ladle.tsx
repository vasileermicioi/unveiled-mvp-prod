// @ladle-only
import type { Story } from "@ladle/react";
import { useEffect, useState } from "react";

import "@unveiled/app/styles/global.css";

interface LoginFormStateProps {
  status: "loading" | "error" | "manual-fallback";
  title?: string;
  message?: string;
  errorMessage?: string;
  continueHref?: string;
  continueLabel?: string;
}

function LoginFormState({
  status,
  title = "Redirecting…",
  message = "You're being signed in. If nothing happens, use the link below to continue manually.",
  errorMessage,
  continueHref = "/app/en/discover",
  continueLabel = "Continue",
}: LoginFormStateProps) {
  const [showFallback, setShowFallback] = useState(status === "manual-fallback");

  useEffect(() => {
    if (status !== "loading") return undefined;
    const handle = window.setTimeout(() => setShowFallback(true), 1500);
    return () => window.clearTimeout(handle);
  }, [status]);

  if (status === "error") {
    return (
      <main className="grid place-items-center bg-brand-grey p-8">
        <div className="grid max-w-md gap-4 rounded-md border-4 border-brand-dark bg-white p-6 text-center">
          <p className="headline-md">Sign-in failed</p>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">
            {errorMessage ?? "Invalid email or password."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid place-items-center bg-brand-grey p-8">
      <div className="grid max-w-md gap-4 rounded-md border-4 border-brand-dark bg-brand-cream p-6 text-center">
        <p className="headline-md">{title}</p>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">
          {message}
        </p>
        {showFallback ? (
          <a
            id="login-redirect-continue"
            href={continueHref}
            className="rounded-md border-2 border-brand-dark bg-brand-yellow px-3 py-2 text-sm font-bold uppercase tracking-widest text-brand-dark"
          >
            {continueLabel}
          </a>
        ) : null}
      </div>
    </main>
  );
}

export default {
  title: "LoginRedirect",
  parameters: { layout: "fullscreen" },
};

export const Success: Story = () => <LoginFormState status="loading" />;

export const Invalid: Story = () => (
  <LoginFormState
    status="error"
    title="Sign-in failed"
    message="Invalid email or password."
  />
);

export const BlockedCookie: Story = () => (
  <LoginFormState status="manual-fallback" />
);