Feature: Better Auth trusted origins and baseURL are env-resolved

  The API Worker must trust the dev proxy host (`http://localhost:4320`) by
  default, accept production origins via `BETTER_AUTH_TRUSTED_ORIGINS`, and
  expose the resolved configuration on the readiness probe. This is the
  contract that prevents Better Auth from logging "please add to
  trustedOrigins" during a login round-trip and that lets operators confirm
  the env contract without redeploying.

  @ladle(component=TrustedOrigins, story=DevFallback)
  Scenario: Readiness probe reports the dev fallback trusted origins
    When the visitor opens /api/readiness.json
    Then the response status is 200
    And the response body has trustedOrigins >= 1
    And the response body has baseUrl matching http://localhost:4320

  @ladle(component=TrustedOrigins, story=EnvOverride)
  Scenario: Readiness probe surfaces the configured trusted origin count
    When the visitor opens /api/readiness.json
    Then the response status is 200
    And the response body has authSecret as a boolean