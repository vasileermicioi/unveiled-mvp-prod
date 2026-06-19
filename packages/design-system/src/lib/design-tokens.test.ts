import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  Border,
  BrandColor,
  Breakpoint,
  Color,
  FontFamily,
  FontSize,
  FontWeight,
  LetterSpacing,
  LineHeight,
  Motion,
  Radius,
  SemanticColor,
  Shadow,
  Spacing,
  StatusColor,
  TextCase,
  ZIndex,
} from "../lib/design-tokens";

const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const TOKENS_PATH = join(REPO_ROOT, "design-tokens.json");

type DtcgNode = Record<string, unknown>;

function readTokens(): DtcgNode {
  return JSON.parse(readFileSync(TOKENS_PATH, "utf8")) as DtcgNode;
}

function collectLeafValues(
  node: unknown,
  prefix: string[],
  out: string[],
): void {
  if (typeof node !== "object" || node === null) return;
  const obj = node as DtcgNode;
  if ("$value" in obj) {
    const raw = obj.$value;
    if (typeof raw === "string" || typeof raw === "number") {
      out.push([...prefix, String(raw)].join("."));
    }
    return;
  }
  for (const [key, child] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    collectLeafValues(child, [...prefix, key], out);
  }
}

function collectResolvedLeafValues(
  node: unknown,
  prefix: string[],
  lookup: Map<string, string>,
  out: string[],
): void {
  if (typeof node !== "object" || node === null) return;
  const obj = node as DtcgNode;
  if ("$value" in obj) {
    const raw = obj.$value;
    if (typeof raw === "string" || typeof raw === "number") {
      let value = String(raw);
      let prev = "";
      while (prev !== value) {
        prev = value;
        value = value.replace(/\{([^}]+)\}/g, (_m, refName: string) => {
          return lookup.get(refName.trim()) ?? _m;
        });
      }
      out.push(value);
    }
    return;
  }
  for (const [key, child] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    collectResolvedLeafValues(child, [...prefix, key], lookup, out);
  }
}

describe("design-tokens enums", () => {
  const tokens = readTokens();

  test("BrandColor covers the brand palette", () => {
    const brand = ((tokens.color as DtcgNode).brand as DtcgNode) ?? {};
    const expected = Object.keys(brand).filter(
      (k) => !k.startsWith("$"),
    ).length;
    expect(Object.keys(BrandColor).length).toBe(expected);
  });

  test("SemanticColor covers every semantic role", () => {
    const semantic = ((tokens.color as DtcgNode).semantic as DtcgNode) ?? {};
    const expected = Object.keys(semantic).filter(
      (k) => !k.startsWith("$"),
    ).length;
    expect(Object.keys(SemanticColor).length).toBe(expected);
  });

  test("StatusColor covers status colors", () => {
    const status = ((tokens.color as DtcgNode).status as DtcgNode) ?? {};
    const expected = Object.keys(status).filter(
      (k) => !k.startsWith("$"),
    ).length;
    expect(Object.keys(StatusColor).length).toBe(expected);
  });

  test("FontFamily, FontSize, FontWeight, LetterSpacing, LineHeight, TextCase exist", () => {
    expect(Object.keys(FontFamily).length).toBeGreaterThan(0);
    expect(Object.keys(FontSize).length).toBeGreaterThan(0);
    expect(Object.keys(FontWeight).length).toBeGreaterThan(0);
    expect(Object.keys(LetterSpacing).length).toBeGreaterThan(0);
    expect(Object.keys(LineHeight).length).toBeGreaterThan(0);
    expect(Object.keys(TextCase).length).toBeGreaterThan(0);
  });

  test("Spacing covers 1..16", () => {
    const spacing = (tokens.spacing as DtcgNode) ?? {};
    const expected = Object.keys(spacing).filter(
      (k) => !k.startsWith("$"),
    ).length;
    expect(Object.keys(Spacing).length).toBe(expected);
    for (const key of Object.keys(Spacing)) {
      expect(Spacing[key as keyof typeof Spacing]).toBeDefined();
    }
  });

  test("Radius covers none, sm, md, lg, full", () => {
    expect(Radius.None).toBeDefined();
    expect(Radius.Sm).toBeDefined();
    expect(Radius.Md).toBeDefined();
    expect(Radius.Lg).toBeDefined();
    expect(Radius.Full).toBeDefined();
  });

  test("Border covers unveiled, unveiled-lg, input, card", () => {
    expect(Border.Unveiled).toBeDefined();
    expect(Border.UnveiledLg).toBeDefined();
    expect(Border.Input).toBeDefined();
    expect(Border.Card).toBeDefined();
  });

  test("Shadow covers the Unveiled offset shadows", () => {
    expect(Shadow.UnveiledSm).toBeDefined();
    expect(Shadow.Unveiled).toBeDefined();
    expect(Shadow.UnveiledLg).toBeDefined();
    expect(Shadow.UnveiledHover).toBeDefined();
    expect(Shadow.UnveiledHoverLg).toBeDefined();
  });

  test("Motion covers durations, easings, and the card-hover transition", () => {
    expect(Motion.DurationFast).toBeDefined();
    expect(Motion.DurationBase).toBeDefined();
    expect(Motion.DurationSlow).toBeDefined();
    expect(Motion.EasingEaseOut).toBeDefined();
    expect(Motion.EasingEaseInOut).toBeDefined();
    expect(Motion.TransitionCardHover).toBeDefined();
  });

  test("Breakpoint covers sm, md, lg, xl, 2xl", () => {
    expect(Breakpoint.Sm).toBe("640px");
    expect(Breakpoint.Md).toBe("768px");
    expect(Breakpoint.Lg).toBe("1024px");
    expect(Breakpoint.Xl).toBe("1280px");
    expect(Breakpoint["2xl"]).toBe("1536px");
  });

  test("ZIndex covers base, dropdown, sticky, modal, toast", () => {
    expect(ZIndex.Base).toBe(0);
    expect(ZIndex.Dropdown).toBe(1000);
    expect(ZIndex.Sticky).toBe(1100);
    expect(ZIndex.Modal).toBe(1300);
    expect(ZIndex.Toast).toBe(1400);
  });

  test("resolved Color values agree with the JSON after reference expansion", () => {
    const brandGroup = (tokens.color as DtcgNode).brand as DtcgNode;
    const brandValues: string[] = [];
    for (const [key, child] of Object.entries(brandGroup)) {
      if (key.startsWith("$")) continue;
      const leaf = child as DtcgNode;
      if (typeof leaf.$value === "string") brandValues.push(leaf.$value);
    }
    const resolve = (raw: string): string => {
      const lookup = new Map(
        brandValues.map((v, i) => [
          Object.keys(brandGroup).filter((k) => !k.startsWith("$"))[i],
          v,
        ]),
      );
      let value = raw;
      let prev = "";
      while (prev !== value) {
        prev = value;
        value = value.replace(/\{([^}]+)\}/g, (_m, refName: string) => {
          return (
            lookup.get(refName.trim().replace(/^color\.brand\./, "")) ?? _m
          );
        });
      }
      return value;
    };
    const resolvedLeaves = new Set<string>();
    const walk = (node: unknown): void => {
      if (typeof node !== "object" || node === null) return;
      const obj = node as DtcgNode;
      if ("$value" in obj) {
        const raw = obj.$value;
        if (typeof raw === "string") resolvedLeaves.add(resolve(raw));
        return;
      }
      for (const [key, child] of Object.entries(obj)) {
        if (key.startsWith("$")) continue;
        walk(child);
      }
    };
    walk((tokens.color as DtcgNode).brand);
    walk((tokens.color as DtcgNode).semantic);
    walk((tokens.color as DtcgNode).status);
    const enumValues = new Set<string>(Object.values(Color));
    for (const leaf of resolvedLeaves) {
      expect(enumValues.has(leaf)).toBe(true);
    }
  });
});
