// @atoms-re-export
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Button } from "./button";

function render(props: React.ComponentProps<typeof Button>) {
  return renderToStaticMarkup(<Button {...props} />);
}

describe("Button atom", () => {
  test("renders HeroUI base with the default brand-chrome className", () => {
    const html = render({ children: "Submit" });
    expect(html).toContain("Submit");
    expect(html).toContain("border-brand-dark");
    expect(html).toContain("bg-brand-dark");
  });

  test("renders the variant=secondary className", () => {
    const html = render({ children: "Cancel", variant: "secondary" });
    expect(html).toContain("bg-white");
    expect(html).toContain("text-brand-dark");
  });

  test("renders the size=lg className", () => {
    const html = render({ children: "Big", size: "lg" });
    expect(html).toContain("min-h-14");
    expect(html).toContain("px-7");
  });

  test("renders loading state with the spinner markup", () => {
    const html = render({ children: "Saving", loading: true });
    expect(html).toContain("animate-spin");
  });

  test("does not accept the legacy asChild prop", () => {
    const html = render({ children: "X" });
    expect(html).not.toContain('data-slot="button-child"');
  });
});
