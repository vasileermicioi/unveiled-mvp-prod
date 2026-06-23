import {
  loginWithEmail,
  logout,
  requestPasswordRecovery,
  signUpWithEmail,
} from "@unveiled/api/auth-account-actions";
import {
  type AppType,
  getCloudflareEnv,
  type RuntimeEnv,
} from "@unveiled/api/worker";

function readEnv(c: { get: (k: string) => unknown }): RuntimeEnv {
  const runtime = c.get("runtimeEnv") as RuntimeEnv | undefined;
  const locals = getCloudflareEnv({ env: runtime });
  return { ...locals, ...(runtime ?? {}) } as RuntimeEnv;
}

export function mountAccountRoutes(app: AppType): void {
  app.post("/api/account/login", async (c) => {
    const env = readEnv(c);
    const body = (await c.req.json()) as unknown;
    const parsed = await readJsonLoginInput(body);
    if (!parsed.ok) {
      return c.json({ ok: false, state: parsed.state }, 400);
    }
    const result = await loginWithEmail(parsed.data, env);
    const responseBody = result.ok
      ? { ok: true, state: result.state, nextPath: result.nextPath }
      : { ok: false, state: result.state };
    return c.json(
      responseBody,
      (result.ok ? 200 : result.status) as 200 | 400 | 401 | 403,
    );
  });

  app.post("/api/account/logout", async (c) => {
    const env = readEnv(c);
    const result = await logout(c.req.raw.headers, env);
    const responseBody = result.ok
      ? { ok: true, state: result.state, nextPath: result.nextPath }
      : { ok: false, state: result.state };
    return c.json(
      responseBody,
      (result.ok ? 200 : result.status) as 200 | 400 | 401 | 403,
    );
  });

  app.post("/api/account/signup", async (c) => {
    const env = readEnv(c);
    const body = (await c.req.json()) as unknown;
    const parsed = await readJsonSignupInput(body);
    if (!parsed.ok) {
      return c.json({ ok: false, state: parsed.state }, 400);
    }
    const result = await signUpWithEmail(parsed.data, env);
    const responseBody = result.ok
      ? { ok: true, state: result.state, nextPath: result.nextPath }
      : { ok: false, state: result.state };
    return c.json(
      responseBody,
      (result.ok ? 200 : result.status) as 200 | 400 | 401 | 403,
    );
  });

  app.post("/api/account/password-recovery", async (c) => {
    const env = readEnv(c);
    const body = (await c.req.json()) as unknown;
    const parsed = await readJsonPasswordRecoveryInput(body);
    if (!parsed.ok) {
      return c.json({ ok: false, state: parsed.state }, 400);
    }
    const result = await requestPasswordRecovery(parsed.data, env);
    return c.json({ ok: true, state: result.state }, 200);
  });
}

async function readJsonLoginInput(body: unknown) {
  const { readLoginInput } = await import("@unveiled/api/auth-forms");
  const req = new Request("https://local/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return readLoginInput(req);
}

async function readJsonSignupInput(body: unknown) {
  const { readSignupInput } = await import("@unveiled/api/auth-forms");
  const req = new Request("https://local/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return readSignupInput(req);
}

async function readJsonPasswordRecoveryInput(body: unknown) {
  const { readPasswordRecoveryInput } = await import(
    "@unveiled/api/auth-forms"
  );
  const req = new Request("https://local/recovery", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return readPasswordRecoveryInput(req);
}
