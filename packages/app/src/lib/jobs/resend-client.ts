export type ResendEmailInput = {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type ResendEmailResult =
  | { ok: true; messageId: string | null }
  | { ok: false; status: number; safeError: string };

function safeProviderError(status: number, body: string) {
  const compact = body.replace(/\s+/g, " ").trim().slice(0, 500);
  return compact ? `Resend ${status}: ${compact}` : `Resend ${status}`;
}

export async function sendResendEmail(
  input: ResendEmailInput,
  fetcher: EmailFetch = fetch,
): Promise<ResendEmailResult> {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      safeError: safeProviderError(response.status, body),
    };
  }

  if (!body) return { ok: true, messageId: null };

  try {
    const parsed = JSON.parse(body) as { id?: unknown };
    return {
      ok: true,
      messageId: typeof parsed.id === "string" ? parsed.id : null,
    };
  } catch {
    return { ok: true, messageId: null };
  }
}
