#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");

const result = spawnSync(
  "bunx",
  [
    "--bun",
    "ladle",
    "build",
    "-o",
    "dist/ladle",
    "--base",
    "/ladle/",
    "--config",
    ".ladle",
  ],
  {
    cwd: pkgRoot,
    stdio: "inherit",
  },
);
process.exit(result.status ?? 1);
