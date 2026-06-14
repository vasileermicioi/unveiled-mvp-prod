/**
 * Legacy barrel kept for backward compatibility with the parity suite.
 * The new step registry lives in `tests/steps/verbs/`. This file is a
 * thin re-export shim — see the `gherkin-domain-features` capability
 * for the migration plan.
 */
export {
  defineStep,
  Given,
  matchesPattern,
  StepRegistry,
  Then,
  When,
} from "./dsl";
export type { Role, SeedLanguage } from "./seed";

export {
  emailForRole,
  seed,
  seedEmails,
  seedIds,
  seedLanguages,
  seedNames,
  seedRoutes,
} from "./seed";
export {
  registerAllSteps,
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
} from "./verbs";
