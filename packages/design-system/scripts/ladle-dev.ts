#!/usr/bin/env bun
import { spawnSync } from "node:child_process";

const result = spawnSync("ladle", ["dev", "-p", "6006"], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
