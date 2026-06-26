import { describe, expect, it } from "bun:test";
import { checkWranglerEnv } from "../../scripts/wrangler-check-env";

const COMPLETE_API = `
name = "unveiled-api"
[env.production.vars]
DATABASE_URL = ""
BETTER_AUTH_URL = ""
PUBLIC_ASSET_BASE_URL = ""
AUTH_COOKIE_DOMAIN = ""
PUBLIC_ORCHESTRATOR_URL = ""
`;

const MISSING_AUTH_COOKIE_DOMAIN = `
name = "unveiled-api"
[env.production.vars]
DATABASE_URL = ""
BETTER_AUTH_URL = ""
PUBLIC_ASSET_BASE_URL = ""
`;

const LANDING_COMPLETE = `
name = "unveiled-landing"
[env.production.vars]
PUBLIC_ASSET_BASE_URL = ""
PUBLIC_ORCHESTRATOR_URL = ""
`;

const ORCHESTRATOR_NO_VARS = `
name = "unveiled"
`;

describe("wrangler:check-env", () => {
  it("fails when AUTH_COOKIE_DOMAIN is missing from wrangler.api.toml", () => {
    const { missing } = checkWranglerEnv(
      MISSING_AUTH_COOKIE_DOMAIN,
      "wrangler.api.toml",
    );
    expect(missing).toContain("AUTH_COOKIE_DOMAIN");
  });

  it("passes when every required key is declared in wrangler.api.toml", () => {
    const { missing } = checkWranglerEnv(COMPLETE_API, "wrangler.api.toml");
    expect(missing).toEqual([]);
  });

  it("passes for wrangler.landing.toml when both required vars are declared", () => {
    const { missing } = checkWranglerEnv(
      LANDING_COMPLETE,
      "wrangler.landing.toml",
    );
    expect(missing).toEqual([]);
  });

  it("passes for wrangler.orchestrator.toml which requires no vars", () => {
    const { missing } = checkWranglerEnv(
      ORCHESTRATOR_NO_VARS,
      "wrangler.orchestrator.toml",
    );
    expect(missing).toEqual([]);
  });

  it("treats PRODUCTION_SECRETS as allowed when absent from [vars]", () => {
    const { missing } = checkWranglerEnv(COMPLETE_API, "wrangler.api.toml");
    expect(missing).not.toContain("BETTER_AUTH_SECRET");
    expect(missing).not.toContain("STRIPE_SECRET_KEY");
    expect(missing).not.toContain("RESEND_API_KEY");
  });

  it("reports missing keys for wrangler.jobs.toml (which requires no vars)", () => {
    const { missing } = checkWranglerEnv(
      ORCHESTRATOR_NO_VARS,
      "wrangler.jobs.toml",
    );
    expect(missing).toEqual([]);
  });
});
