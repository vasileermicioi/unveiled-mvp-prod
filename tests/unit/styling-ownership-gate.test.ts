import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";

describe("styling ownership gate", () => {
  it("spawns `bun run check:styling-ownership` and asserts exit 0", () => {
    const result = spawnSync("bun", ["run", "check:styling-ownership"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    if (result.status !== 0) {
      console.error(result.stdout);
      console.error(result.stderr);
    }
    expect(result.status).toBe(0);
  });
});
