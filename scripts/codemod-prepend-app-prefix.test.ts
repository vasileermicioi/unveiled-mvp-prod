#!/usr/bin/env bun
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const SCRIPT = join(import.meta.dir, "codemod-prepend-app-prefix.ts");
const TMP_ROOT = join(import.meta.dir, ".tmp-codemod-test");

function runCodemod(
  featureContent: string,
  args: string[],
): {
  status: number;
  stdout: string;
  stderr: string;
  rewritten: string;
} {
  if (existsSync(TMP_ROOT)) rmSync(TMP_ROOT, { recursive: true, force: true });
  mkdirSync(TMP_ROOT, { recursive: true });
  const featurePath = join(TMP_ROOT, "smoke.feature");
  writeFileSync(featurePath, featureContent, "utf8");

  const result = spawnSync("bun", ["run", SCRIPT, ...args], {
    cwd: TMP_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      CODEMOD_FEATURE_ROOT: TMP_ROOT,
    },
  });
  const rewritten = existsSync(featurePath)
    ? readFileSync(featurePath, "utf8")
    : "";
  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    rewritten,
  };
}

describe("codemod-prepend-app-prefix", () => {
  beforeEach(() => {
    if (existsSync(TMP_ROOT))
      rmSync(TMP_ROOT, { recursive: true, force: true });
    mkdirSync(TMP_ROOT, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TMP_ROOT))
      rmSync(TMP_ROOT, { recursive: true, force: true });
  });

  describe("URL regex (rewriting real feature paths in --apply mode)", () => {
    it("prefixes a bare app route", () => {
      const input = `Feature: f\n  Background:\n    Given x\n\n  Scenario: s\n    When the visitor opens /discover\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /app/discover");
    });

    it("prefixes a localized app route", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /en/admin\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /app/en/admin");
    });

    it("prefixes an app route with a query string", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /discover?tab=metrics\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain(
        "When the visitor opens /app/discover?tab=metrics",
      );
    });

    it("does not touch a full http URL", () => {
      const input = `Feature: f\n  Background:\n    Given the orchestrator is running on http://localhost:4320\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("http://localhost:4320");
      expect(r.rewritten).not.toContain("http://app/");
    });

    it("does not touch a content-type string", () => {
      const input = `Feature: f\n  Scenario: s\n    And the Content-Type is application/json; charset=utf-8\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("application/json; charset=utf-8");
      expect(r.rewritten).not.toContain("application/app/");
    });

    it("does not touch /healthz", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /healthz\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /healthz\n");
    });

    it("does not touch /readyz", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /readyz\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /readyz\n");
    });

    it("does not touch /api/* paths", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /api/openapi.json\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain(
        "When the visitor opens /api/openapi.json\n",
      );
    });

    it("does not touch /ladle/* paths", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /ladle/index\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /ladle/index\n");
    });

    it("does not touch /favicon.ico or /favicon.svg", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /favicon.ico\n    And the visitor opens /favicon.svg\n    Then ok\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /favicon.ico\n");
      expect(r.rewritten).toContain("And the visitor opens /favicon.svg\n");
    });
  });

  describe("per-scenario skip for normalization tests", () => {
    it("skips a scenario whose title matches 'normalizes'", () => {
      const input = `Feature: f\n  Scenario: GET /en/admin normalizes to /app/en/admin\n    When the visitor opens /en/admin\n    Then the Location header is /app/en/admin\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /en/admin\n");
      expect(r.rewritten).toContain("the Location header is /app/en/admin\n");
      expect(r.rewritten).not.toContain("/app/en/admin\n    Then");
    });

    it("skips a scenario whose title matches 'does not normalize'", () => {
      const input = `Feature: f\n  Scenario: GET /admin does not normalize when no locale is set\n    When the visitor opens /admin\n    Then the Location header is /app/en/admin\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /admin\n");
      expect(r.rewritten).not.toContain("/app/admin\n");
    });

    it("resets the skip flag at the next Scenario", () => {
      const input = `Feature: f\n  Scenario: GET /admin normalizes to /app/en/admin\n    When the visitor opens /admin\n\n  Scenario: Plain app route\n    When the visitor opens /discover\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /admin\n");
      expect(r.rewritten).toContain("When the visitor opens /app/discover\n");
    });

    it("does not skip a scenario whose title does not mention normalization", () => {
      const input = `Feature: f\n  Scenario: Plain app route\n    When the visitor opens /discover\n`;
      const r = runCodemod(input, ["--apply"]);
      expect(r.rewritten).toContain("When the visitor opens /app/discover\n");
    });
  });

  describe("--verify exit code", () => {
    it("exits 0 when every URL is prefixed", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /app/discover\n`;
      const r = runCodemod(input, ["--verify"]);
      expect(r.status).toBe(0);
    });

    it("exits 1 when an un-prefixed app route is present", () => {
      const input = `Feature: f\n  Scenario: s\n    When the visitor opens /discover\n`;
      const r = runCodemod(input, ["--verify"]);
      expect(r.status).toBe(1);
    });

    it("exits 0 even when content-types and full URLs are present", () => {
      const input = `Feature: f\n  Background:\n    Given the orchestrator is running on http://localhost:4320\n  Scenario: s\n    And the Content-Type is application/json; charset=utf-8\n    When the visitor opens /healthz\n    And the visitor opens /api/openapi.json\n`;
      const r = runCodemod(input, ["--verify"]);
      expect(r.status).toBe(0);
    });
  });
});
