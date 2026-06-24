// @atoms-re-export
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TextInput } from "./text-input";

function render(props: React.ComponentProps<typeof TextInput>) {
  return renderToStaticMarkup(<TextInput {...props} />);
}

describe("TextInput atom", () => {
  test("renders HeroUI Input with the design-system chrome class on the wrapper", () => {
    const html = render({ placeholder: "Email", "aria-label": "Email" });
    expect(html).toContain("Email");
    expect(html).toContain("unveiled-text-input-wrapper");
    expect(html).toContain("unveiled-text-input-input");
  });

  test("renders the supplied defaultValue", () => {
    const html = render({
      defaultValue: "ada@example.com",
      "aria-label": "Email",
    });
    expect(html).toContain('value="ada@example.com"');
  });

  test("coerces numeric value to a string before passing to HeroUI", () => {
    const html = render({
      value: 42,
      "aria-label": "Count",
    });
    expect(html).toContain('value="42"');
  });

  test("passes type through to the underlying input", () => {
    const html = render({
      type: "password",
      placeholder: "Secret",
      "aria-label": "Secret",
    });
    expect(html).toContain('type="password"');
  });
});
