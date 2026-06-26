// @ladle-only
import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";

interface TrustedOriginsViewProps {
  trustedOrigins: string[];
  baseUrl: string;
  authSecretPresent: boolean;
}

function TrustedOriginsView({
  trustedOrigins,
  baseUrl,
  authSecretPresent,
}: TrustedOriginsViewProps) {
  return (
    <main className="grid gap-6 bg-brand-grey p-8">
      <header className="grid gap-1">
        <p className="headline-md">Better Auth — resolved config</p>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">
          Mirror of the API Worker&apos;s /api/readiness.json payload
        </p>
      </header>
      <dl className="grid max-w-2xl gap-3 rounded-md border-4 border-brand-dark bg-white p-6 text-sm">
        <div className="grid grid-cols-[10rem_1fr] gap-2">
          <dt className="font-bold">baseUrl</dt>
          <dd className="font-mono">{baseUrl}</dd>
        </div>
        <div className="grid grid-cols-[10rem_1fr] gap-2">
          <dt className="font-bold">authSecret</dt>
          <dd className="font-mono">{String(authSecretPresent)}</dd>
        </div>
        <div className="grid grid-cols-[10rem_1fr] gap-2">
          <dt className="font-bold">trustedOrigins</dt>
          <dd className="grid gap-1">
            {trustedOrigins.map((origin) => (
              <span key={origin} className="font-mono">
                {origin}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </main>
  );
}

export default {
  title: "TrustedOrigins",
  parameters: { layout: "fullscreen" },
};

export const DevFallback: Story = () => (
  <TrustedOriginsView
    trustedOrigins={[
      "http://localhost:4320",
      "http://127.0.0.1:4320",
      "http://localhost:8787",
    ]}
    baseUrl="http://localhost:4320"
    authSecretPresent
  />
);

export const EnvOverride: Story = () => (
  <TrustedOriginsView
    trustedOrigins={[
      "https://app.unveiled.com",
      "https://admin.unveiled.com",
      "http://localhost:4320",
      "http://127.0.0.1:4320",
      "http://localhost:8787",
    ]}
    baseUrl="https://app.unveiled.com"
    authSecretPresent
  />
);