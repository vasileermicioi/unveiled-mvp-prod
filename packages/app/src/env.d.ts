/// <reference types="@cloudflare/workers-types" />
/// <reference path="../../../worker-configuration.d.ts" />

import type { Logger } from "~/lib/logger";

declare global {
  namespace App {
    interface Locals {
      logger: Logger;
      traceId: string;
    }
  }
}
