// @ladle-only
import type { Story } from "@ladle/react";

interface DispatchRow {
  readonly prefix: string;
  readonly target:
    | "API Worker"
    | "App Worker"
    | "Landing Worker"
    | "Orchestrator";
  readonly example: string;
}

const DISPATCH_ROWS: readonly DispatchRow[] = [
  { prefix: "/api/*", target: "API Worker", example: "/api/openapi.json" },
  { prefix: "/app/*", target: "App Worker", example: "/app/en/discover" },
  { prefix: "/*", target: "Landing Worker", example: "/" },
  { prefix: "/healthz", target: "Orchestrator", example: "/healthz" },
  { prefix: "/readyz", target: "Orchestrator", example: "/readyz" },
];

const SECURITY_HEADERS = [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "X-Frame-Options",
];

const READINESS_SURFACES = [
  { surface: "api", status: "ok" },
  { surface: "app", status: "ok" },
  { surface: "landing", status: "ok" },
];

function DispatchTable() {
  return (
    <table
      aria-label="Orchestrator dispatch map"
      className="w-full border-collapse text-left text-sm"
    >
      <thead>
        <tr>
          <th className="border-b border-slate-300 px-3 py-2">Path prefix</th>
          <th className="border-b border-slate-300 px-3 py-2">Dispatched to</th>
          <th className="border-b border-slate-300 px-3 py-2">Example</th>
        </tr>
      </thead>
      <tbody>
        {DISPATCH_ROWS.map((row) => (
          <tr key={row.prefix}>
            <td className="border-b border-slate-200 px-3 py-2 font-mono">
              {row.prefix}
            </td>
            <td className="border-b border-slate-200 px-3 py-2">
              {row.target}
            </td>
            <td className="border-b border-slate-200 px-3 py-2 font-mono">
              {row.example}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SecurityHeadersList() {
  return (
    <ul
      aria-label="Orchestrator security headers"
      className="list-disc pl-6 text-sm"
    >
      {SECURITY_HEADERS.map((header) => (
        <li key={header} className="font-mono">
          {header}
        </li>
      ))}
    </ul>
  );
}

function ReadinessEnvelope() {
  return (
    <figure
      aria-label="Orchestrator readiness envelope"
      className="rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs"
    >
      <pre>
        {JSON.stringify({ status: "ok", surfaces: READINESS_SURFACES }, null, 2)}
      </pre>
    </figure>
  );
}

export const PublicHostnameServesLandingHero: Story = () => (
  <section aria-label="Dispatch map" className="space-y-6 p-6">
    <header>
      <h2 className="text-lg font-semibold">Orchestrator dispatch</h2>
      <p className="text-sm text-slate-600">
        Every inbound request on the public hostname is dispatched by the
        orchestrator Worker to the matching downstream Worker.
      </p>
    </header>
    <DispatchTable />
  </section>
);

export const PublicHostnameServesAppDiscover: Story = () => (
  <section aria-label="Dispatch map" className="space-y-6 p-6">
    <DispatchTable />
  </section>
);

export const PublicHostnameServesOpenApiDocument: Story = () => (
  <section aria-label="Dispatch map" className="space-y-6 p-6">
    <DispatchTable />
  </section>
);

export const LivenessProbeReturnsOk: Story = () => (
  <section aria-label="Liveness probe" className="space-y-3 p-6">
    <h2 className="text-lg font-semibold">/healthz</h2>
    <p className="text-sm text-slate-600">
      The orchestrator answers <code>/healthz</code> directly with a{" "}
      <code>200</code> response whose body is <code>ok</code>. No downstream
      Worker is invoked.
    </p>
    <pre className="rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs">
      HTTP/1.1 200 OK{"\n"}Content-Type: text/plain; charset=utf-8{"\n\n"}ok
    </pre>
  </section>
);

export const ReadinessProbeComposesDownstreamHealth: Story = () => (
  <section aria-label="Readiness probe" className="space-y-3 p-6">
    <h2 className="text-lg font-semibold">/readyz</h2>
    <p className="text-sm text-slate-600">
      The orchestrator probes every downstream Worker in parallel and returns a
      composed envelope. <code>200</code> only when every surface is healthy.
    </p>
    <ReadinessEnvelope />
  </section>
);

export const ReadinessProbeReportsDegradedWhenARed: Story = () => (
  <section aria-label="Readiness probe degraded" className="space-y-3 p-6">
    <h2 className="text-lg font-semibold">/readyz (degraded)</h2>
    <p className="text-sm text-slate-600">
      When any downstream Worker is red, the orchestrator returns{" "}
      <code>503</code> with the failing surface flagged.
    </p>
    <pre className="rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs">
      {JSON.stringify(
        {
          status: "degraded",
          surfaces: [
            { surface: "api", status: "ok" },
            { surface: "app", status: "timeout" },
            { surface: "landing", status: "ok" },
          ],
        },
        null,
        2,
      )}
    </pre>
  </section>
);

export const SecurityHeadersAppliedToLanding: Story = () => (
  <section aria-label="Security headers" className="space-y-3 p-6">
    <h2 className="text-lg font-semibold">Uniform security headers</h2>
    <p className="text-sm text-slate-600">
      Every non-API response is stamped with the following header policy.
    </p>
    <SecurityHeadersList />
  </section>
);

export const BareAppPathRedirectsToLocalizedAppHome: Story = () => (
  <section aria-label="Bare /app redirect" className="space-y-3 p-6">
    <h2 className="text-lg font-semibold">/app → /app/&lt;lang&gt;/</h2>
    <p className="text-sm text-slate-600">
      The bare paths <code>/app</code> and <code>/app/</code> have no canonical
      route. The orchestrator inserts the language segment and returns a{" "}
      <code>302</code> redirect. The language is resolved from the{" "}
      <code>unveiled_lang</code> cookie, the <code>Accept-Language</code>{" "}
      header, or the default <code>en</code>.
    </p>
    <pre className="rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs">
      HTTP/1.1 302 Found{"\n"}Location: /app/en/
    </pre>
  </section>
);

export const BareAppPathRespectsAcceptLanguage: Story = () => (
  <section
    aria-label="Bare /app/ with Accept-Language"
    className="space-y-3 p-6"
  >
    <h2 className="text-lg font-semibold">
      /app/ → /app/de/ when Accept-Language is de
    </h2>
    <pre className="rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs">
      GET /app/ HTTP/1.1{"\n"}Accept-Language: de-DE,de;q=0.9{"\n\n"}HTTP/1.1
      302 Found{"\n"}Location: /app/de/
    </pre>
  </section>
);

export const BareAppPathPreservesQueryString: Story = () => (
  <section aria-label="Bare /app query preservation" className="space-y-3 p-6">
    <h2 className="text-lg font-semibold">
      /app preserves the original query string
    </h2>
    <pre className="rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs">
      GET /app?venuePartner=abc&venueToken=xyz HTTP/1.1{"\n\n"}HTTP/1.1 302
      Found{"\n"}Location: /app/en/?venuePartner=abc&venueToken=xyz
    </pre>
  </section>
);

export default {
  title: "core-platform / OrchestratorDispatch",
};
