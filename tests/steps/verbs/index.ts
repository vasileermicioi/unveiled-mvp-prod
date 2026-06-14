import type { StepRegistry } from "../dsl";
import { registerA11ySteps } from "./a11y.steps";
import { registerAuthSteps } from "./auth.steps";
import { registerDataSteps } from "./data.steps";
import { registerFormsSteps } from "./forms.steps";
import { registerI18nSteps } from "./i18n.steps";
import { registerListsSteps } from "./lists.steps";
import { registerModalsSteps } from "./modals.steps";
import { registerNavigationSteps } from "./navigation.steps";
import { registerNetworkSteps } from "./network.steps";
import { registerTimeSteps } from "./time.steps";
import { registerVisualSteps } from "./visual.steps";

export function registerAllSteps(registry: StepRegistry): void {
  registerAuthSteps(registry);
  registerNavigationSteps(registry);
  registerFormsSteps(registry);
  registerListsSteps(registry);
  registerModalsSteps(registry);
  registerNetworkSteps(registry);
  registerDataSteps(registry);
  registerI18nSteps(registry);
  registerTimeSteps(registry);
  registerA11ySteps(registry);
  registerVisualSteps(registry);
}

export {
  registerA11ySteps,
  registerAuthSteps,
  registerDataSteps,
  registerFormsSteps,
  registerI18nSteps,
  registerListsSteps,
  registerModalsSteps,
  registerNavigationSteps,
  registerNetworkSteps,
  registerTimeSteps,
  registerVisualSteps,
};
