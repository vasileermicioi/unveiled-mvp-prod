import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";

describe("design-system atomic-layers gate", () => {
  it("spawns `bun run check:atomic-layers` and asserts exit 0", () => {
    const result = spawnSync(
      "bun",
      ["run", "--filter", "@unveiled/design-system", "check:atomic-layers"],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    if (result.status !== 0) {
      console.error(result.stdout);
      console.error(result.stderr);
    }
    expect(result.status).toBe(0);
  });
});
