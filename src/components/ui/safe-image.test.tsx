import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SafeImage } from "./safe-image";

function render(props: React.ComponentProps<typeof SafeImage>) {
  return renderToStaticMarkup(<SafeImage {...props} />);
}

describe("SafeImage", () => {
  test("renders the supplied src when it is a non-empty string", () => {
    const html = render({
      src: "https://cdn.example.com/x.png",
      alt: "x",
    });
    expect(html).toContain('src="https://cdn.example.com/x.png"');
    expect(html).toContain('data-fallback="false"');
    expect(html).not.toContain("/placeholders/");
  });

  test("renders the event placeholder when src is empty", () => {
    const html = render({ src: "", alt: "x" });
    expect(html).toContain('src="/placeholders/event.svg"');
    expect(html).toContain('data-fallback="true"');
  });

  test("renders the event placeholder when src is null", () => {
    const html = render({ src: null, alt: "x" });
    expect(html).toContain('src="/placeholders/event.svg"');
    expect(html).toContain('data-fallback="true"');
  });

  test("renders the event placeholder when src is undefined", () => {
    const html = render({ alt: "x" });
    expect(html).toContain('src="/placeholders/event.svg"');
    expect(html).toContain('data-fallback="true"');
  });

  test("renders the event placeholder when src is whitespace", () => {
    const html = render({ src: "   ", alt: "x" });
    expect(html).toContain('src="/placeholders/event.svg"');
    expect(html).toContain('data-fallback="true"');
  });

  test("renders the partner placeholder for fallbackKind=partner", () => {
    const html = render({ src: null, fallbackKind: "partner", alt: "x" });
    expect(html).toContain('src="/placeholders/partner.svg"');
  });

  test("renders the avatar placeholder for fallbackKind=avatar", () => {
    const html = render({ fallbackKind: "avatar", alt: "x" });
    expect(html).toContain('src="/placeholders/avatar.svg"');
  });

  test("prefers an explicit fallbackSrc over the kind default", () => {
    const html = render({
      src: null,
      fallbackKind: "event",
      fallbackSrc: "/custom/placeholder.svg",
      alt: "x",
    });
    expect(html).toContain('src="/custom/placeholder.svg"');
    expect(html).not.toContain("/placeholders/event.svg");
  });

  test("passes through className to the underlying img", () => {
    const html = render({
      src: "https://cdn.example.com/x.png",
      alt: "x",
      className: "h-48 w-full object-cover",
    });
    expect(html).toContain("h-48");
    expect(html).toContain("object-cover");
  });

  test("passes through additional img attributes", () => {
    const html = render({
      src: "https://cdn.example.com/x.png",
      alt: "x",
      loading: "lazy",
      decoding: "async",
    });
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });
});
