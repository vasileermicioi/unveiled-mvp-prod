import { describe, expect, test } from "bun:test";
import { z } from "zod";

import {
  actionSuccess,
  fieldErrorsFromZodError,
  formFailure,
  parseFormInput,
} from "@/lib/forms/action-result";
import { queryKeys } from "@/lib/forms/query-keys";

describe("form action result helpers", () => {
  test("maps zod issues to react-hook-form compatible field paths", () => {
    const result = z
      .object({
        profile: z.object({
          email: z.string().email("Invalid email"),
        }),
      })
      .safeParse({ profile: { email: "bad" } });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFromZodError(result.error)).toEqual({
        "profile.email": "Invalid email",
      });
    }
  });

  test("returns validation and safe form failure envelopes", () => {
    const parsed = parseFormInput(
      z.object({ name: z.string().min(1, "Name required") }),
      {
        name: "",
      },
    );

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.fieldErrors?.name).toBe("Name required");
      expect(parsed.formError).toBe("Check the highlighted fields.");
    }

    expect(formFailure("Authentication required.")).toEqual({
      ok: false,
      formError: "Authentication required.",
    });
  });

  test("success envelopes include invalidation hints", () => {
    const result = actionSuccess({
      notice: { type: "success", message: "Saved." },
      invalidate: [queryKeys.authViewer, queryKeys.profile("user-1")],
    });

    expect(result.ok).toBe(true);
    expect(result.invalidate).toEqual([
      ["auth", "viewer"],
      ["profile", "user-1"],
    ]);
  });
});
