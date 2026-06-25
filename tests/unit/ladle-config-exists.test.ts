import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../packages/design-system/.ladle/config.mjs",
);

describe("packages/design-system/.ladle/config.mjs", () => {
  it("exists", () => {
    expect(existsSync(CONFIG_PATH)).toBe(true);
  });

  it("exports a default object with a non-empty stories array and base /ladle/", async () => {
    const module = (await import(CONFIG_PATH)).default as {
      stories?: unknown;
      base?: unknown;
    };
    expect(Array.isArray(module.stories)).toBe(true);
    expect((module.stories as unknown[]).length).toBeGreaterThan(0);
    expect(module.base).toBe("/ladle/");
  });

  it("references every story root the proposal enumerates", () => {
    const source = readFileSync(CONFIG_PATH, "utf8");
    expect(source).toContain("src/**/*.ladle.tsx");
    expect(source).toContain("../app/src/**/*.ladle.tsx");
    expect(source).toContain("../../tests/features/**/*.ladle.tsx");
    expect(source).toContain("../../tests/ladle/**/*.ladle.tsx");
  });
});

describe("packages/design-system/vite.config.mjs", () => {
  const VITE_CONFIG_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/design-system/vite.config.mjs",
  );

  it("exists and ships a React dedupe", () => {
    expect(existsSync(VITE_CONFIG_PATH)).toBe(true);
    const source = readFileSync(VITE_CONFIG_PATH, "utf8");
    expect(source).toContain('dedupe: ["react", "react-dom"]');
  });

  it("mounts the @tailwindcss/vite plugin so Tailwind utilities compile", () => {
    const source = readFileSync(VITE_CONFIG_PATH, "utf8");
    expect(source).toContain('import tailwindcss from "@tailwindcss/vite"');
    expect(source).toContain("plugins: [tailwindcss()]");
  });
});

describe("packages/design-system/package.json devDependencies", () => {
  const PACKAGE_JSON_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/design-system/package.json",
  );

  it("declares @tailwindcss/vite so the Ladle Vite config can import it", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8")) as {
      devDependencies?: Record<string, string>;
    };
    expect(pkg.devDependencies?.["@tailwindcss/vite"]).toBeTruthy();
  });
});

describe("packages/design-system/public/app symlink", () => {
  const PUBLIC_APP = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/design-system/public/app",
  );
  const APP_PUBLIC = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/app/public",
  );

  it("exists and resolves to packages/app/public", () => {
    expect(existsSync(PUBLIC_APP)).toBe(true);
    const real = realpathSync(PUBLIC_APP);
    expect(real).toBe(realpathSync(APP_PUBLIC));
  });

  it("exposes the app's logo SVG under the public/app/logos/ path", () => {
    const logo = resolve(PUBLIC_APP, "logos/unveiled-logo-black.svg");
    expect(existsSync(logo)).toBe(true);
    const source = readFileSync(logo, "utf8");
    expect(source).toContain("<svg");
  });
});

describe("packages/design-system/src/atoms/button/button.tsx loading-state spinner", () => {
  const BUTTON_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/design-system/src/atoms/button/button.tsx",
  );

  it("gives the loading-state spinner a clear right margin", () => {
    const source = readFileSync(BUTTON_PATH, "utf8");
    const spinnerMatch = source.match(
      /spinner=\{[\s\S]*?aria-hidden="true"[\s\S]*?className="([^"]+)"[\s\S]*?\/>/,
    );
    expect(spinnerMatch).not.toBeNull();
    expect(spinnerMatch?.[1]).toContain("mr-2");
    expect(spinnerMatch?.[1]).toContain("shrink-0");
  });
});

describe("packages/design-system/src/heroui-replica/HeroButton.ladle.tsx Loading story", () => {
  const LADLE_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/design-system/src/heroui-replica/HeroButton.ladle.tsx",
  );

  it("declares explicit horizontal padding so the spinner never overlaps the label", () => {
    const source = readFileSync(LADLE_PATH, "utf8");
    // The Loading story's <Button> should carry px-5 py-3 (matches the design-system
    // Button's "default" size so the spinner-to-label gap is consistent).
    expect(source).toMatch(/Loading[\s\S]{0,200}px-5\s+py-3/);
  });
});

describe("@unveiled/design-system global.css @source directives", () => {
  const GLOBAL_CSS_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/design-system/src/styles/global.css",
  );

  it("scans the design-system src/ so the loading-state spinner's classes are generated", () => {
    const source = readFileSync(GLOBAL_CSS_PATH, "utf8");
    expect(source).toContain("../**/*.{ts,tsx}");
  });

  it("opts the loading-state spinner's border-current class into Tailwind", () => {
    const source = readFileSync(GLOBAL_CSS_PATH, "utf8");
    expect(source).toContain('"border-current"');
  });
});
