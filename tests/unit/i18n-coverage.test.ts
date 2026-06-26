#!/usr/bin/env bun
import { describe, expect, it } from "bun:test";

import {
  collectDefinedPaths,
  collectReferences,
  evaluateCoverage,
  type Reference,
} from "../../scripts/i18n-coverage";

function makeAppCopy(overrides: {
  deMissing?: string[];
  enMissing?: string[];
  present?: string[];
}): Record<string, unknown> {
  const present = new Set(
    overrides.present ?? ["shell.nav.openMenu", "shell.nav.openApp"],
  );
  const deMissing = new Set(overrides.deMissing ?? []);
  const enMissing = new Set(overrides.enMissing ?? []);
  return {
    DE: {
      shell: {
        nav: {
          openMenu:
            present.has("shell.nav.openMenu") &&
            !deMissing.has("shell.nav.openMenu")
              ? "DE open menu"
              : undefined,
          openApp:
            present.has("shell.nav.openApp") &&
            !deMissing.has("shell.nav.openApp")
              ? "DE open app"
              : undefined,
        },
      },
    },
    EN: {
      shell: {
        nav: {
          openMenu:
            present.has("shell.nav.openMenu") &&
            !enMissing.has("shell.nav.openMenu")
              ? "EN open menu"
              : undefined,
          openApp:
            present.has("shell.nav.openApp") &&
            !enMissing.has("shell.nav.openApp")
              ? "EN open app"
              : undefined,
        },
      },
    },
  };
}

function refs(paths: string[]): Reference[] {
  return paths.map((path) => ({
    path,
    file: "fixture/file.ts",
    line: 1,
  }));
}

describe("i18n coverage gate", () => {
  it("fails when a referenced key is missing in DE", () => {
    const defined = collectDefinedPaths(
      makeAppCopy({
        deMissing: ["shell.nav.openMenu"],
        present: ["shell.nav.openMenu", "shell.nav.openApp"],
      }),
    );
    const result = evaluateCoverage(defined, refs(["shell.nav.openMenu"]));
    expect(result.failures.length).toBe(1);
    expect(result.failures[0]).toContain("shell.nav.openMenu");
    expect(result.failures[0]).toContain("DE");
    expect(result.failures[0]).toContain("fixture/file.ts:1");
  });

  it("fails when a referenced key is missing in EN", () => {
    const defined = collectDefinedPaths(
      makeAppCopy({
        enMissing: ["shell.nav.openApp"],
        present: ["shell.nav.openMenu", "shell.nav.openApp"],
      }),
    );
    const result = evaluateCoverage(defined, refs(["shell.nav.openApp"]));
    expect(result.failures.length).toBe(1);
    expect(result.failures[0]).toContain("shell.nav.openApp");
    expect(result.failures[0]).toContain("EN");
  });

  it("passes when every referenced key is present in both DE and EN", () => {
    const defined = collectDefinedPaths(
      makeAppCopy({ present: ["shell.nav.openMenu", "shell.nav.openApp"] }),
    );
    const result = evaluateCoverage(
      defined,
      refs(["shell.nav.openMenu", "shell.nav.openApp"]),
    );
    expect(result.failures).toEqual([]);
    expect(result.leafCount).toBe(2);
    expect(result.referencedPathCount).toBe(2);
  });

  it("treats branch references as known (intermediate object access)", () => {
    const defined = collectDefinedPaths(
      makeAppCopy({ present: ["shell.nav.openMenu"] }),
    );
    const result = evaluateCoverage(defined, refs(["shell.nav"]));
    expect(result.failures).toEqual([]);
    expect(result.leafCount).toBe(0);
    expect(result.referencedPathCount).toBe(1);
  });
});

describe("i18n coverage gate — production wiring", () => {
  it("evaluates the production appCopy without failures", () => {
    const defined = collectDefinedPaths();
    const productionReferences = collectReferences();
    const result = evaluateCoverage(defined, productionReferences);
    expect(result.failures).toEqual([]);
    expect(result.leafCount).toBeGreaterThan(0);
  });
});
