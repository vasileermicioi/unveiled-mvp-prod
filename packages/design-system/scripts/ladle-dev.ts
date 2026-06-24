#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");

const result = spawnSync(
  "bunx",
  ["--bun", "ladle", "dev", "-p", "6006", "--config", ".ladle"],
  {
    cwd: pkgRoot,
    stdio: "inherit",
  },
);
process.exit(result.status ?? 1);
