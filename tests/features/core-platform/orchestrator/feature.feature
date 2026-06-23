Feature: Routing Orchestrator Dispatch
  The orchestrator Worker owns the public URL surface for `unveiled.app`. It
  dispatches every inbound request to the right downstream service binding
  (`/api/*` → API Worker, `/app/*` → app Astro Worker, `/*` → landing Astro
  Worker) and answers `/healthz` (liveness) and `/readyz` (readiness)
  directly. The orchestrator also applies uniform security headers
  (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options) to
  every non-API response and emits structured JSON request logs with a
  `requestId` correlation id forwarded to downstream Workers via
  `x-request-id`.

  Background:
    Given the orchestrator is running on http://localhost:4320

  @ladle(component=OrchestratorDispatch, story=PublicHostnameServesLandingHero)
  Scenario: GET / returns the landing hero
    When the visitor opens /
    Then the response status is 200
    And the page renders the landing hero
    And the hero exposes a call to action whose href is /app

  @ladle(component=OrchestratorDispatch, story=PublicHostnameServesAppDiscover)
  Scenario: GET /app/<lang>/discover returns the app's discover page
    When the visitor opens /app/en/discover
    Then the response status is 200
    And the page renders the discover surface
    And every emitted asset href begins with /app/

  @ladle(component=OrchestratorDispatch, story=PublicHostnameServesOpenApiDocument)
  Scenario: GET /api/openapi.json returns the Hono OpenAPI document
    When the visitor opens /api/openapi.json
    Then the response status is 200
    And the Content-Type is application/json; charset=utf-8
    And the response body is a valid OpenAPI 3.1 document with an info.title of "Unveiled API"

  @ladle(component=OrchestratorDispatch, story=LivenessProbeReturnsOk)
  Scenario: GET /healthz returns 200 with body "ok"
    When the visitor opens /healthz
    Then the response status is 200
    And the response body is "ok"

  @ladle(component=OrchestratorDispatch, story=ReadinessProbeComposesDownstreamHealth)
  Scenario: GET /readyz returns 200 when every downstream Worker is green
    Given every downstream Worker is reachable
    When the visitor opens /readyz
    Then the response status is 200
    And the response body has a surfaces envelope listing api, app, and landing as "ok"

  @ladle(component=OrchestratorDispatch, story=ReadinessProbeReportsDegradedWhenARed)
  Scenario: GET /readyz returns 503 when any downstream Worker is red
    Given the app downstream Worker is unreachable
    When the visitor opens /readyz
    Then the response status is 503
    And the response body surfaces the app as not "ok"

  @ladle(component=OrchestratorDispatch, story=SecurityHeadersAppliedToLanding)
  Scenario: Landing responses carry the uniform security header policy
    When the visitor opens /
    Then the response includes Strict-Transport-Security
    And the response includes X-Content-Type-Options: nosniff
    And the response includes Referrer-Policy: strict-origin-when-cross-origin
    And the response includes X-Frame-Options: DENY
    And the response includes a Content-Security-Policy that allows 'self' and *.stripe.com

  @ladle(component=OrchestratorDispatch, story=BareAppPathRedirectsToLocalizedAppHome)
  Scenario: GET /app redirects to /app/en/ when no language preference is set
    When the visitor opens /app
    Then the response status is 302
    And the Location header is /app/en/

  @ladle(component=OrchestratorDispatch, story=BareAppPathRespectsAcceptLanguage)
  Scenario: GET /app/ redirects to /app/de/ when Accept-Language prefers German
    Given the visitor sends Accept-Language: de-DE,de;q=0.9
    When the visitor opens /app/
    Then the response status is 302
    And the Location header is /app/de/

  @ladle(component=OrchestratorDispatch, story=BareAppPathPreservesQueryString)
  Scenario: GET /app preserves the original query string on the redirect
    When the visitor opens /app?venuePartner=abc&venueToken=xyz
    Then the response status is 302
    And the Location header is /app/en/?venuePartner=abc&venueToken=xyz