import { z } from "zod";
import { Given, type StepRegistry, When } from "../dsl";
import { emailForRole, type Role, seed } from "../seed";

const roleSchema = z.object({
  role: z.enum(["Guest", "Member", "Partner", "Admin"]),
});

export function registerAuthSteps(registry: StepRegistry): void {
  Given(
    registry,
    "the user is logged in as <role>",
    roleSchema,
    async (page, { role }) => {
      await seed(role as Role);
      const email = emailForRole(role as Role);
      if (role === "Guest") {
        await page.context().clearCookies();
        return;
      }
      await page.context().addCookies([
        {
          name: "unveiled_session",
          value: `seed:${email}`,
          url: "http://localhost:4321",
        },
      ]);
    },
  );

  When(registry, "the user logs out", z.object({}), async (page) => {
    await page.context().clearCookies();
  });
}
