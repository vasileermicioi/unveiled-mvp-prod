import type { AppType } from "@unveiled/api/worker";

export function mountAuthRoutes(app: AppType): void {
  app.use("/api/auth/*", async (c, _next) => {
    const auth = c.get("auth");
    return auth.handler(c.req.raw);
  });
}
