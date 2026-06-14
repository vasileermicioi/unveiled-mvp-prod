import type { Logger } from "@/lib/logger";

declare global {
  namespace App {
    interface Locals {
      logger: Logger;
      traceId: string;
    }
  }
}
