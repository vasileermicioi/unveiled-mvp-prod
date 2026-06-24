export * from "./app-layout";
export * from "./landing-layout";

import * as AppLayout from "./app-layout";
import * as LandingLayout from "./landing-layout";

export const Layouts = {
  ...AppLayout,
  ...LandingLayout,
} as const;
