import type { Locator, Page } from "@playwright/test";
import type { ZodTypeAny, z } from "zod";

export type StepArgs = z.infer<ZodTypeAny>;

export type StepFn<Args extends StepArgs> = (
  page: Page,
  args: Args,
) => Promise<void> | void;

export interface StepDefinition<Args extends StepArgs> {
  pattern: string;
  kind: "Given" | "When" | "Then";
  args: z.ZodType<Args>;
  run: StepFn<Args>;
}

export class StepRegistry {
  private steps: StepDefinition<StepArgs>[] = [];

  register<Args extends StepArgs>(
    kind: StepDefinition<Args>["kind"],
    pattern: string,
    args: z.ZodType<Args>,
    run: StepFn<Args>,
  ): void {
    this.steps.push({
      kind,
      pattern,
      args: args as unknown as z.ZodType<StepArgs>,
      run: run as unknown as StepFn<StepArgs>,
    });
  }

  resolve(
    kind: StepDefinition<StepArgs>["kind"],
    stepText: string,
  ): StepDefinition<StepArgs> | undefined {
    const normalized = stepText.trim();
    return this.steps.find(
      (step) => step.kind === kind && matchesPattern(step.pattern, normalized),
    );
  }

  all(): readonly StepDefinition<StepArgs>[] {
    return this.steps;
  }
}

export function matchesPattern(pattern: string, text: string): boolean {
  const regex = new RegExp(`^${pattern.replace(/<(\w+)>/g, "(.+)")}$`);
  return regex.test(text);
}

export function defineStep<Args extends StepArgs>(
  registry: StepRegistry,
  kind: StepDefinition<Args>["kind"],
  pattern: string,
  args: z.ZodType<Args>,
  run: StepFn<Args>,
): void {
  registry.register(kind, pattern, args, run);
}

export function Given<Args extends StepArgs>(
  registry: StepRegistry,
  pattern: string,
  args: z.ZodType<Args>,
  run: StepFn<Args>,
): void {
  defineStep(registry, "Given", pattern, args, run);
}

export function When<Args extends StepArgs>(
  registry: StepRegistry,
  pattern: string,
  args: z.ZodType<Args>,
  run: StepFn<Args>,
): void {
  defineStep(registry, "When", pattern, args, run);
}

export function Then<Args extends StepArgs>(
  registry: StepRegistry,
  pattern: string,
  args: z.ZodType<Args>,
  run: StepFn<Args>,
): void {
  defineStep(registry, "Then", pattern, args, run);
}

export type { Locator, Page };
